import express from "express";
import {ObjectId} from "mongodb";
import { connectDb, getCollection } from './../data/database.js';
const router = express.Router();

router.post("/create", async (req, res) => {
    try {
        const document = req.body;
        let db = await connectDb();
        const collection = await getCollection(db, "crowd");
        const result = await collection.insertOne(document);

        return res.status(201).send({
            message: "Document created successfully", _id: result.insertedId
        });
    } catch (error) {
        return res.status(500).send({ error: "Failed to create document" });
    }
});

router.put("/update", async (req, res) => {
    try {
        const { _id, ...rest } = req.body;
        let db = await connectDb();
        const collection = await getCollection(db, "crowd");

        await collection.updateOne({ _id: ObjectId.createFromHexString(_id) }, { $set: rest });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).send({ error: "Failed to update document" });
    }
});

router.get('/all', async (req, res) => {
    let db = await connectDb();
    const collection = await getCollection(db, "crowd");
    const result = await collection.find().toArray();

    res.status(200).json(result);
});

router.get('/:id', async (req, res) => {
    try {
        let db = await connectDb();
        const collection = await getCollection(db, "crowd");
        const result = await collection.findOne({ _id: new ObjectId(req.params.id) });

        res.status(200).json(result);
    } catch (error) {
        res.status(404).send({ error: "Document not found" });
    }
});

export default router;
