import { MongoClient } from "mongodb";
import 'dotenv/config';

const dbName = process.env.DB_NAME || "mumin";
let dbUrl = "";

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    dbUrl = process.env.DB_DEV_LOCAL || "mongodb://localhost:27017";
} else if (process.env.NODE_ENV === 'production') {
    const PROTOCOL ="mongodb+srv";
    const USER = "lojn22";
    const CLUSTER_DOMAIN = "text-editor.y0d6w.mongodb.net";
    const PARAMS = "?retryWrites=true&w=majority&appName=text-editor";

    dbUrl = `${PROTOCOL}://${USER}:${process.env.DB_PASS}@${CLUSTER_DOMAIN}/${PARAMS}`;
}

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
