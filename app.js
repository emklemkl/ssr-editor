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
import session from 'express-session';
import passport from 'passport';
import auth from './routes/auth.js';
import cookieParser from 'cookie-parser';

const port = process.env.PORT||5000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: corsConfig });

app.use(express.json());
app.use(cookieParser());
app.use(session({ 
    secret: process.env.SESSION,
    resave: false, 
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 dag i millisekunder
        httpOnly: true, // Gör cookien tillgänglig endast på servern
        secure: process.env.NODE_ENV === 'production', // Använd endast i säkra anslutningar (HTTPS) i produktion
        // secure: true 
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', auth);

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
        // let myRoom;
        // let gotUpdate = false;
        io.sockets.on('connect', socketCom(io, db));
        // io.sockets.on('connect', async function (socket) {
        //     console.log("Socket Id:", socket.id); // Nått lång och slumpat
        //     const collection = await getCollection(db, "crowd");

        //     socket.on('create', async function (room) {
        //         myRoom = room;
        //         socket.join(room);
        //         const res = await collection.findOne({ _id: new ObjectId(room) });

        //         io.to(room).emit("doc-update", res);
        //     });

            // socket.on("doc-update", async (res) => {
            //     const parsedRes = JSON.parse(res);
            //     const { _id, editors, ...rest } = parsedRes;
            
            //     try {
            //         // Hämta det befintliga dokumentet
            //         const existingDocument = await collection.findOne({ _id: ObjectId.createFromHexString(_id) });
                    
            //         if (!existingDocument) {
            //             console.error("Document not found");
            //             return;
            //         }

            //         console.log("Parsed Response:", parsedRes);
            //         console.log("Existing Document:", existingDocument);
            
            //         // Bevara ownerId från det befintliga dokumentet
            //         const updatedFields = {
            //             ...rest,
            //             ownerId: existingDocument.ownerId,  // Bevarar ownerId
            //             editors: editors && editors.length > 0 ? editors : existingDocument.editors
            //         };

            
            //         // Uppdatera dokumentet med nya fält men behåll ownerId
            //         await collection.updateOne(
            //             { _id: ObjectId.createFromHexString(_id) },
            //             { $set: updatedFields }
            //         );
            
            //         gotUpdate = true;
            //     } catch (e) {
            //         console.error("Error updating document:", e);
            //     }
            // });

            // setInterval(async () => {
            //     if (gotUpdate) {
            //         const res = await collection.findOne({ _id: new ObjectId(myRoom) });

            //         io.to(myRoom).emit("doc-update", res);
            //     } gotUpdate = false;
            // }, 2000);
        // });
       

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
