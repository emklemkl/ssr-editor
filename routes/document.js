import express from "express";
import {ObjectId} from "mongodb";
import { connectDb, getCollection } from './../data/database.js';
import { userIsAuthenticated } from "../middleware/auth-middleware.js";
const router = express.Router();

router.post("/create", userIsAuthenticated, async (req, res) => {
    try {
        const document = { ...req.body,
            userId: req.user._id
        };
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

router.put("/update", userIsAuthenticated, async (req, res) => {
    try {
        const { _id, ...rest } = req.body;
        let db = await connectDb();
        const collection = await getCollection(db, "crowd");

        const document = await collection.findOne({_id: new ObjectId(), userId: req.user._id});
        if (!document) {
            return res.status(403).send({error: "You are not authorized  to update this document"})
        }

        await collection.updateOne({ _id: ObjectId.createFromHexString(_id) }, { $set: rest });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).send({ error: "Failed to update document" });
    }
});

router.get('/all', userIsAuthenticated, async (req, res) => {
    console.log("Authenticated user:", req.user);
    
    let db = await connectDb();
    const collection = await getCollection(db, "crowd");
    const result = await collection.find({userId: req.user._id}).toArray();

    res.status(200).json(result);
});

router.get('/:id', userIsAuthenticated, async (req, res) => {
    try {
        let db = await connectDb();
        const collection = await getCollection(db, "crowd");
        const result = await collection.findOne({ _id: new ObjectId(req.params.id), userId: req.user._id });

        if(!result) {
            return res.status(404).send({error: "You don't have access to the document"});
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(404).send({ error: "Document not found" });
    }
});

export default router;
