import 'dotenv/config'

const port = process.env.PORT;

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';

import docs from "./docs.js";
import { MongoClient as mongo, ObjectId } from "mongodb";
const app = express();
app.use(cors())
app.disable('x-powered-by');

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}
app.use(bodyParser.urlencoded({ extended: true }));

const dsn = process.env.DBWEBB_DSN || "mongodb://localhost:27017/mumin";
const client = await mongo.connect(dsn);
const db = await client.db();
const col = await db.collection("crowd")

app.post("/create", async (req, res) => {
    const result = await col.insertOne(req.body);
    return res.status(201).send();
});

app.get('/new-doc', (req, res) => {
    return res.render('new-doc');
});

app.put("/update", async (req, res) => {
    const { _id, ...rest } = req.body
    await col.updateOne({ _id: ObjectId.createFromHexString(_id) }, { $set: rest })
    return res.status(204).send();
});

app.get('/document', async (req, res) => {
    const result = await col.findOne(req.query)
    res.status(200).json(result)
});

app.get('/', async (req, res) => {
    const result = await col.find().toArray()
    res.status(200).json(result)
});

app.get("/test_route", async (req, res) => {
    // const result = await documents.addOne(req.body);
    res.send("apa")
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}. \n\n http://localhost:${port}/ \n`);
});
export default app;