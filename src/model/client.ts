import { MongoClient, Db } from "mongodb";
import path from 'path';

// This module makes sure the same pool is used across the app

let client: MongoClient | null = null;
let database: Db | null = null;

export async function connect(uri: string): Promise<void> {
  if (database) return;

  // connect the MongoDB pool
  client = new MongoClient(uri);
  await client.connect();

  database = client.db('atelierDB');
}

export async function disconnect(): Promise<void> {
  if (!client) return;

  await client.close();
  client = null;
  database = null;
}

export function getClient(): MongoClient {
  if (!client) throw new Error('Client is not connected');

  return client;
}

export function getDatabase(): Db {
  if (!database) throw new Error('Database is not connected');

  return database;
}
