import { MongoClient as mongo, ObjectId } from "mongodb";
import 'dotenv/config'
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import database from './data/database.js';

const port = process.env.PORT;
const app = express();
// const collectionName = "crowd";

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.disable('x-powered-by');

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

let client; 
let col;

// async function startServer() {
//     try {
//         client = await database.connectDb();
//         col = await database.getCollection(client, collectionName);
        
//         app.listen(port, () => {
//             console.log(`Server is running on port ${port}. \n\n http://localhost:${port}/ \n`);
//         });
//     } catch (error) {
//         console.error("Failed to connect to the database:", error);
//         process.exit(1);
//     }
// }
async function startServer(collectionName) {
    try {
        client = await database.connectDb();
        col = await database.getCollection(client, collectionName); // Dynamiskt baserat på collectionName
        
        if (!col) {
            throw new Error(`Collection ${collectionName} does not exist.`);
        }

        app.listen(port, () => {
            console.log(`Server is running on port ${port}. \n\n http://localhost:${port}/ \n`);
        });
    } catch (error) {
        console.error("Failed to connect to the database:", error);
        process.exit(1);
    }
}

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

app.get("/test", async (req, res) => {
    let db;

    try {
        db = await database.connectDb();

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

const collectionName = process.argv[2] || 'collection1';  // Collection kan anges via kommandoraden eller default
startServer(collectionName);
// startServer();
export default app;