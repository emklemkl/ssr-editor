/**
 *
 *  This module is for testing different scenarios, it will be removed later.
 *
 */

import express from "express";
import { connectDb, getCollection } from './../data/database.js';
const router = express.Router();
const collectionName = "crowd";

router.get("/test_route", async (req, res) => {
    // const result = await documents.addOne(req.body);
    res.send("apa");
});

router.get("/test", async (req, res) => {
    let db = await connectDb();
    const collection = await getCollection(db, collectionName);
    const getAllData = await collection.find().toArray();

    res.json(getAllData);
});

export default router;
