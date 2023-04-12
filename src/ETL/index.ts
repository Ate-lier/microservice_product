import { MongoClient, OptionalId, Document } from 'mongodb';
import CSVReader from './CSVReader';
import path from 'path';

// MongoDB connection meta-data
const connectionString = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(connectionString);
const database = client.db('atelierDB');
const productCollection = database.collection('products');

// Product Interface
interface Product extends OptionalId<Document> {
  product_id: number;
  name: string;
  slogan: string;
  description: string;
  category: string;
  default_price: number;
  styles: Style[];
  features: { name: string; value: string | null }[];
  characteristics: string[];
  related: number[];
}

// Style Interface
interface Style {
  name: string;
  sale_price: number | null;
  original_price: number;
  default_style: number;
  photos: { url: string; thumbnail_url: string }[];
  skus: { size: string; quantity: number }[]; 
}

// All required file names
const fileNames = [
  'characteristics',
  'features',
  'photos',
  'products',
  'related',
  'skus',
  'styles'
];

// Define the main ETL function, return promise of total minutes used
// Extract data from CSVs and batch insert to MongoDB
async function ETL(batchSize: number = 2000): Promise<number> {

  // Instantiate all CSV readers and remove headers from each
  // Use Index Signitures here for clean code
  interface Readers { 
    [key: string]: CSVReader 
  }

  const readers: Readers = {};

  for (const name of fileNames) {
    const absPath = path.join(__dirname, '../../CSV/files', name + '.csv');
    const reader = new CSVReader(absPath);
    
    // Use first 4 characters as reader name(key)
    readers[name.slice(0, 4)] = reader;
    // Skip header(first line)
    await reader.next();
  }

  // Variables to keep track of loop progress 
  const startTime = new Date().valueOf();
  let batch: Array<Product> = [];
  let batchCount = 1;

  // Before ETL starts, remove all legacy data
  await productCollection.deleteMany({});
  console.log('Collection Products has been cleared');

  // Top Level of the Product document, determined by product_id
  while (true) {
    // Insert when batch is full
    if (batch.length >= batchSize) {
      await productCollection.insertMany(batch);
      batch = [];
      console.log(`Batch No.${batchCount++} Finished...`);
    }
    
    // Get next line from product.csv
    const nextLine = await readers.prod.next();

    // If past the last line, insert batch and end loop
    if (!nextLine) {
      await productCollection.insertMany(batch);
      console.log(`Batch No.${batchCount++} Finished...`);
      break;
    }
    
    // Initiate Product Document Object
    const product: Product = {
      product_id: Number(nextLine[0]),
      name: String(nextLine[1]),
      slogan: String(nextLine[2]),
      description: String(nextLine[3]),
      category: String(nextLine[4]),
      default_price: Number(nextLine[5]),
      styles: [],
      features: [],
      characteristics: [],
      related: []
    };
   
    // Ordering of other four properties are rankded by easiness
    // 1. related
    while (true) {
      // You should always peek before you go to next line
      // One exception is product.csv cuz it holds top level data
      const nextLine = await readers.rela.peek();
      
      // Stop when go past last line or current product
      if (nextLine === null) break;
      if (Number(nextLine[1]) !== product.product_id) break;
      
      // Add data and move to nextline
      product.related.push(Number(nextLine[2]));
      await readers.rela.next();
    }

    // 2. characteristics
    while (true) {
      const nextLine = await readers.char.peek();
      
      if (nextLine === null) break;
      if (Number(nextLine[1]) !== product.product_id) break;
      
      product.characteristics.push(String(nextLine[2]));
      await readers.char.next();
    }

    // 3. features 
    while (true) {
      const nextLine = await readers.feat.peek();

      if (nextLine === null) break;
      if (Number(nextLine[1]) !== product.product_id) break;

      const name = String(nextLine[2]);
      const value = nextLine[3] === null
        ? nextLine[3]
        : String(nextLine[3]);
      
      product.features.push({ name, value });
      await readers.feat.next();
    }

    // Here comes the most complicated one --- style
    // 4. styles
    // Top level of styles, determined by product_id
    // Each style_id corresponds to unique photos and skus
    styleLoop: while (true) {
      const nextLine = await readers.styl.peek();

      if (nextLine === null) break;
      if (Number(nextLine[1]) !== product.product_id) break;
      
      // Initiate a style object as well as styleId
      // This styleId serves as the foreign key for phots and skus
      const styleId = Number(nextLine[0]);
      const style: Style = {
        name: String(nextLine[2]),
        sale_price: (
          nextLine[3] === null
            ? nextLine[3]
            : Number(nextLine[3]) 
        ),
        original_price: Number(nextLine[4]),
        default_style: Number(nextLine[5]),
        photos: [],
        skus: []
      };

      // Here are the tricky parts
      // Two more loops to fill photos and skus
      // 1. photos
      while (true) {
        const nextLine = await readers.phot.peek();

        if (nextLine === null) break;
        // Same logic, but this time with styleId
        if (Number(nextLine[1]) !== styleId) break;

        const url = String(nextLine[2]);
        const thumbnail_url = String(nextLine[3]);

        style.photos.push({ url, thumbnail_url });
        await readers.phot.next();
      }

      // 2.skus 
      while (true) {
        const nextLine = await readers.skus.peek();

        if (nextLine === null) break;
        if (Number(nextLine[1]) !== styleId) break;

        const size = String(nextLine[2]);
        const quantity = Number(nextLine[3]);

        style.skus.push({ size, quantity });
        await  readers.skus.next();
      }
     
      product.styles.push(style); 
      await readers.styl.next();
    }

    // Once all embedded doccuments inserted, add the product document to batch
    batch.push(product);
  }
  
  const endTime = new Date().valueOf();
  await client.close();
  return Math.floor((endTime - startTime)/60_000);
}

ETL()
  .then(timeUsed => console.log(`ETL took ${timeUsed} minutes in total...`))
  .catch(error => console.log(`ETL Error: ${error}`));
