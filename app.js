import cors from 'cors';
import bodyParser from 'body-parser';
import express from 'express';
import morgan from 'morgan';
import 'dotenv/config';
import { ObjectId } from "mongodb";
import database from './data/database.js';

const port = process.env.PORT||5000;
const app = express();
const collectionName = "crowd";

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.disable('x-powered-by');

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

let db;

async function startServer() {
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

app.post("/document/create", async (req, res) => {
    const { collectionName, ...document } = req.body;

    try {
        const collection = await database.getCollection(db, collectionName);
        const result = await collection.insertOne(document);

        return res.status(201).send({ message: "Document created successfully",
            id: result.insertedId });
    } catch (error) {
        return res.status(500).send({ error: "Failed to create document" });
    }
});

app.get('/document/new-doc', (req, res) => {
    return res.render('new-doc');
});

app.put("/document/update", async (req, res) => {
    const { collectionName, _id, ...rest } = req.body;

    try {
        const collection = await database.getCollection(db, collectionName);

        await collection.updateOne({ _id: ObjectId.createFromHexString(_id) }, { $set: rest });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).send({ error: "Failed to update document" });
    }
});

app.get('/document/:id', async (req, res) => {
    const collection = await database.getCollection(db, 'crowd');

    console.log(req.params);
    const result = await collection.findOne({ _id: new ObjectId(req.params.id) });

    if (result) {
        res.status(200).json(result);
    } else {
        res.status(404).send({ error: "Document not found" });
    }
});

app.get('/document', async (req, res) => {
    const collection = await database.getCollection(db, collectionName);
    const result = await collection.findOne(req.query);

    if (result) {
        res.status(200).json(result);
    } else {
        res.status(404).send({ error: "Document not found" });
    }
});

app.get('/', async (req, res) => {
    const collection = await database.getCollection(db, collectionName);
    const result = await collection.find().toArray();

    res.status(200).json(result);
});

app.get("/test_route", async (req, res) => {
    // const result = await documents.addOne(req.body);
    res.send("apa");
});

app.get("/test", async (req, res) => {
    const collection = await database.getCollection(db, collectionName);
    const getAllData = await collection.find().toArray();

    res.json(getAllData);
});

startServer();
export default app;
