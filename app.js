import { MongoClient as mongo, ObjectId } from "mongodb";
import 'dotenv/config'
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import {connectDb, getCollection} from './data/database.js'; 
import document from "./routes/document.js"
import sandbox from "./routes/sandbox.js"

const port = process.env.PORT||5000;
const app = express();
const collectionName = "crowd";

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.disable('x-powered-by');

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

let db;

(async () => {
    try {
        db = await connectDb()
        app.use("/document", document)
        app.use("/sandbox", sandbox)
        app.listen(port, () => {
            console.log(`Server is running on port ${port}. \n\n http://localhost:${port}/ \n`);
        });
    } catch (error) {
        console.error("Failed to connect to the database:", error);
        process.exit(1);
    }
})();

export default app;