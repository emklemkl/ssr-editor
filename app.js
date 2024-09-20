import 'dotenv/config'

const port = process.env.PORT;

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';

import docs from "./docs.js";
import database from './data/database.js';

const app = express();

app.disable('x-powered-by');

app.use(express.static(path.join(process.cwd(), "public")));

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/create", async (req, res) => {
    const result = await documents.addOne(req.body);
    return res.redirect(`/1`);
});

app.get("/test_route", async (req, res) => {
    // const result = await documents.addOne(req.body);
    res.send("apa")
});

app.get("/test", async (req, res) => {
    // const db = await database.getDb();
    // const resultSet = await db.collection.find({}).toArray();
    // await db.client.close();
    // console.log('dataaaan', resultSet)
    // res.json(resultSet)
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