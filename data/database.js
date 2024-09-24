import { MongoClient } from "mongodb";
import 'dotenv/config';

// Environmental variables
const dbName = process.env.DB_NAME;
const dbUrl = process.env.DB_URL;

const database = {
    connectDb: async function () {
        // DSN dynamically based on NODE_ENV
        let dsn = `${dbUrl}/${dbName}`;
        
        if (process.env.NODE_ENV === 'test') {
            dsn = `${dbUrl}/test`;  // Testdatabase
        }

        // MongoClient connects to MongoDB
        const client = new MongoClient(dsn, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Connect to the MongoDB server
        await client.connect();

        return client;
    },

    getCollection: async function getCollection(client, collectionName) {
        const db = await client.db();
        const collection = await db.collection(collectionName)

        return collection;
    }
};

export default database;
