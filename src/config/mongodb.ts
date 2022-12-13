// External Dependencies
import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

// Global Variables
export const collections: { orders?: mongoDB.Collection } = {}

// Initialize Connection
export async function connectToDatabase() {
    dotenv.config();

    const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DATABASE_URL);

    await client.connect();

    const db: mongoDB.Db = client.db(process.env.DB_NAME);

    const orderCollection: mongoDB.Collection = db.collection(process.env.COLLECTION_NAME);

    collections.orders = orderCollection;

    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${orderCollection.collectionName}`);
}