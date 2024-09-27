import { MongoClient } from "mongodb";
import 'dotenv/config';

const dbName = process.env.DB_NAME || "mumin";
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017";


/**
 * @description Checks it db connection is established and returns connected db obj
 * @returns database object Db.
 */
let db;
let client;

export async function connectDb() {
    if (!db) {
        console.info(" \n-----> CREATING NEW DB CONNECTION <-----\n");
        client = new MongoClient(dbUrl);
        await client.connect();
        db = await client.db(dbName);
    }
    return db;
}

export async function getCollection(db, collectionName) {
    const collection = await db.collection(collectionName);

    return collection;
}

// export default {connectDb, getCollection};
