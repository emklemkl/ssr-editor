import 'dotenv/config'
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';
import docs from "./docs.js";
import database from './data/database.js';

const port = process.env.PORT;
const app = express();

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.disable('x-powered-by');

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

app.post("/create", async (req, res) => {
        try {
        const db = await database.getDb();
        const result = await db.collection.insertOne(req.body);
        await db.client.close();
        return res.status(201).json({ success: true, insertedId: result.insertedId });
    } catch (error) {
        console.error("Error inserting document:", error);
        return res.status(500).json({ success: false, message: "An error occurred" });
    }
});

app.get('/new-doc', (req, res) => {
    return res.render('new-doc');
});

app.put("/update", async (req, res) => {
    try {
        const { _id, ...rest } = req.body;
        const db = await database.getDb();
        
        // Uppdatera dokumentet baserat på dess _id
        await db.collection.updateOne({ _id: ObjectId(_id) }, { $set: rest });
        await db.client.close();

        return res.status(204).send();  // No Content response
    } catch (error) {
        console.error("Error updating document:", error);
        return res.status(500).json({ success: false, message: "An error occurred" });
    }
});

app.get('/document', async (req, res) => {
    try {
        const db = await database.getDb();
        const result = await db.collection.findOne(req.query);
        await db.client.close();

        return res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching document:", error);
        return res.status(500).json({ success: false, message: "An error occurred" });
    }
});

app.get('/', async (req, res) => {
    try {
        const db = await database.getDb();
        const result = await db.collection.find().toArray();
        await db.client.close();

        return res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching documents:", error);
        return res.status(500).json({ success: false, message: "An error occurred" });
    }
});

app.get("/test_route", async (req, res) => {
    // const result = await documents.addOne(req.body);
    res.send("apa")
});

app.get("/test", async (req, res) => {
    let db;

    try {
        db = await database.getDb();

        const filter = { bor: 'Mumindalen' };
        const keyObject = await db.collection.findOne(filter);

        if (keyObject) {
            return res.json({ data: keyObject });
        }
    } catch (e) {
        return res.status(500).json({
            errors: {
                status: 500,
                source: "/",
                title: "Database error",
                detail: e.message
            }
        });
    } finally {
        await db.client.close();
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}. \n\n http://localhost:${port}/ \n`);
});
export default app;