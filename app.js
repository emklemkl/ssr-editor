import cors from 'cors';
import bodyParser from 'body-parser';
import express from 'express';
import morgan from 'morgan';
import 'dotenv/config';
import { connectDb } from './data/database.js';
import document from "./routes/document.js";
import sandbox from "./routes/sandbox.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { corsConfig } from './config/cors-config.js';
import { socketCom } from './routes/socket.js';

const port = process.env.PORT||5000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: corsConfig });

app.use(cors(corsConfig));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.disable('x-powered-by');


// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

// USE io.to for sending to all other members of the room INCLUDING yourself
// USE socket.broadcast.to for sending to all other members of the room EXCEPT yourself


(async () => {
    try {
        const db = await connectDb();

        app.use("/document", document);
        app.use("/sandbox", sandbox);
        io.sockets.on('connect', socketCom(io, db));

        httpServer.listen(port, () => {
            console.log(`\nPort ${port} set (if local: http://localhost:5000/)\n`);
            console.log(`Server is running in ${process.env.NODE_ENV.toUpperCase()} mode \n`);
        });
    } catch (error) {
        console.error("Failed to connect to the database:", error);
        process.exit(1);
    }
})();

export default httpServer;

