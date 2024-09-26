import { MongoClient } from "mongodb";
import 'dotenv/config';

// Environmental variables
const dbName = process.env.DB_NAME || "mumin";
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017";

const database = {
    connectDb: async function () {
        // DSN dynamically based on NODE_ENV
        let dsn = `${dbUrl}/${dbName}`;

        if (process.env.NODE_ENV === 'test') {
            dsn = `${dbUrl}/test`;  // Testdatabase
        }

        // MongoClient connects to MongoDB
        const client = new MongoClient(dsn, {
        });

        // Connect to the MongoDB server
        await client.connect();

        return client;
    },

    getCollection: async function getCollection(client, collectionName) {
        const db = await client.db();
        const collection = await db.collection(collectionName);

        return collection;
    }
};

export default database;
