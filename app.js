import { MongoClient as mongo, ObjectId } from "mongodb";
import 'dotenv/config'
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import database from './data/database.js';

const port = process.env.PORT;
const app = express();
const collectionName = "crowd";

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.disable('x-powered-by');

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

let db;

async function startServer(collectionName) {
    try {
        db = await database.connectDb();
        
        app.listen(port, () => {
            console.log(`Server is running on port ${port}. \n\n http://localhost:${port}/ \n`);
        });
    } catch (error) {
        console.error("Failed to connect to the database:", error);
        process.exit(1);
    }
}

app.post("/create", async (req, res) => {
    const collection = await database.getCollection(db, 'crowd');
    const result = await collection.insertOne(req.body);
    return res.status(201).send({ message: "Document created successfully", id: result.insertedId });
});

app.get('/new-doc', (req, res) => {
    return res.render('new-doc');
});

app.put("/update", async (req, res) => {
    const { _id, ...rest } = req.body;
    const collection = await database.getCollection(db, 'crowd');
    await collection.updateOne({ _id: ObjectId.createFromHexString(_id) }, { $set: rest });
    return res.status(204).send();
});

app.get('/document', async (req, res) => {
    const collection = await database.getCollection(db, 'crowd');
    const result = await collection.findOne(req.query);
    if (result) {
        res.status(200).json(result);
    } else {
        res.status(404).send({ error: "Document not found" });
    }
});

app.get('/', async (req, res) => {
    const collection = await database.getCollection(db, 'crowd');
    const result = await collection.find().toArray();
    res.status(200).json(result);
});

app.get("/test_route", async (req, res) => {
    // const result = await documents.addOne(req.body);
    res.send("apa")
});

app.get("/test", async (req, res) => {
    const collection = await database.getCollection(db, 'crowd');
    const getAllData = await collection.find().toArray();
    res.json(getAllData);
});

startServer();
export default app;