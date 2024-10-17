import { getCollection } from './../data/database.js';
import { ObjectId } from "mongodb";

export function socketCom(io, db) {
    return async function (socket) {
        let myRoom;
        let latestEmit = Date.now();

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
                if (Date.now() - latestEmit > 500) { // Avoid overloading the server
                    socket.broadcast.to(myRoom).emit("doc-update", parsedRes);
                }
            } catch (e) {
                console.error("Error updating document:", e);
            }
        });
    };
}
