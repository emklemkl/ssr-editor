import cors from 'cors';
import bodyParser from 'body-parser';
import express from 'express';
import morgan from 'morgan';
import 'dotenv/config';
import {connectDb, getCollection} from './data/database.js';
import document from "./routes/document.js";
import sandbox from "./routes/sandbox.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { corsConfig } from './config/cors-config.js';
import { ObjectId } from "mongodb";

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
// USE socket.to for sending to all other members of the room EXCEPT yourself


(async () => {
    try {
        const db = await connectDb();

        app.use("/document", document);
        app.use("/sandbox", sandbox);
            let myRoom;
            let gotUpdate = false;

            io.sockets.on('connect', async function (socket) {
                console.log("Socket Id:", socket.id); // Nått lång och slumpat
                const collection = await getCollection(db, "crowd");

                socket.on('create', async function (room) {
                    myRoom = room;
                    socket.join(room);
                    const res = await collection.findOne({ _id: new ObjectId(room) });

                    io.to(room).emit("doc-update", res);
                });

                socket.on("doc-update", async (res) => {
                    const parsedRes = JSON.parse(res);
                    const { _id, ...rest } = parsedRes;

                    try {
                        await collection.updateOne({ _id: ObjectId.createFromHexString(_id) }
                            , { $set: rest });
                        gotUpdate = true;
                    } catch (e) {
                        console.error("Error updating document:", e);
                    }
                });

                setInterval(async () => {
                    if (gotUpdate) {
                        const res = await collection.findOne({ _id: new ObjectId(myRoom) });

                        io.to(myRoom).emit("doc-update", res);
                    } gotUpdate = false;
                }, 2000);
            });

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

