import { MongoClient } from "mongodb";

const collectionName = "crowd";

const database = {
    getDb: async function getDb() {
        let dsn = `mongodb://localhost:27017/mumin`;

        if (process.env.NODE_ENV === 'test') {
            dsn = "mongodb://localhost:27017/test";
        }

        // Use MongoClient to connect
        const client = new MongoClient(dsn, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Connect to the MongoDB server
        await client.connect();

        // Access the database and collection
        const db = client.db();
        const collection = db.collection(collectionName);

        return {
            collection: collection,
            client: client,
        };
    }
};

export default database;
