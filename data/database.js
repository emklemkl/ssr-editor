import { MongoClient } from "mongodb";
import 'dotenv/config';

// Miljövariabler
const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;
const dbUrl = process.env.DB_URL;

const database = {
    getDb: async function getDb() {
        // DSN dynamiskt baserat på NODE_ENV
        let dsn = `${dbUrl}/${dbName}`;
        
        if (process.env.NODE_ENV === 'test') {
            dsn = `${dbUrl}/test`;  // Testdatabas
        }

        // MongoClient ansluter till MongoDB
        const client = new MongoClient(dsn, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Anslut till MongoDB-servern
        await client.connect();

        // Åtkomst till databas och collection
        const db = client.db();
        const collection = db.collection(collectionName);

        return {
            collection: collection,
            client: client,
        };
    }
};

export default database;
