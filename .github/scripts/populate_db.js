import { MongoClient as mongo } from "mongodb";
const dsn = process.env.DBWEBB_DSN || "mongodb://localhost:27017/mumin";
(async () => {
    try {
        const client = await mongo.connect(dsn);
        const db = await client.db();
        const col = await db.collection("crowd")
        const res = await col.insertOne({ name: "Mumintrollet" })
        console.log("Document inserted:", res.insertedId);
        await client.close();
    } catch (error) {
        console.error("Error populating the database:", error);
    }
})();