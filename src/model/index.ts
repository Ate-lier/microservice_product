import { getDatabase } from './client';

// Possible outcome of findOne are document, null, networkError
// But we handle error in middleware level
export async function queryProductById(id: number): Promise<any> {
  const database = getDatabase();
  const collection = database.collection('products');

  // _id is useless in our case
  const document = await collection.findOne(
    { product_id: id },
    { projection: { _id: 0} }
  );

  // Will call some other fucntions/API here, refactor later

  return document;
}

// this function is only called from transaction microserive

//async function updateSkus() {}

