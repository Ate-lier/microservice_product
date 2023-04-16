import { MongoClient, Db } from "mongodb";
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../../.env') });


// This module makes sure the same pool is used across the app

let database: Db | null = null;

export async function connect(uri: string): Promise<any> {
  if (database) return;

  // connect the MongoDB pool
  const client = new MongoClient(uri);
  await client.connect();

  database = client.db('atelierDB');
}

export function getDatabase(): Db {
  if (!database) throw new Error('Database is not connected');

  return database;
}
