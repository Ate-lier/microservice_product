import { MongoClient } from "mongodb";
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../../.env') });

// ENV variables
const connectionString = process.env.URI || 'mongodb://127.0.0.1:27017';
const databaseName = process.env.DB || 'atelierDB';
const collectionName = process.env.COLLECTION || 'products';

// Get product collection
const client = new MongoClient(connectionString);
const database = client.db(databaseName);
const productCollection = database.collection(collectionName);

// good, but wrap the whole thing in a function
async function getProductById(id: number): Promise<any> {
    try {
      const result = await productCollection.findOne({
        product_id: id
      });
      return result;
    } catch (err) {
      console.log(err)
    }
}

export { getProductById };