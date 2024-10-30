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
        socket.on("comment-create", async (res) => {
            const parsedRes = JSON.parse(res);
            const { _id, comments } = parsedRes;

            try {
                const newCommentKey = Object.keys(comments)[0];

                Object.keys(comments);
                const newCommentValue = comments[newCommentKey];

                if (!newCommentKey) {
                    throw new Error("Invalid comment key");
                }
                await collection.updateOne(
                    { _id: ObjectId.createFromHexString(_id) },
                    { $set: { [`comments.${newCommentKey}`]: newCommentValue } }
                );
            } catch (e) {
                console.error("Error updating document:", e);
            }
        });
        socket.on("comment-change", async (res) => {
            const parsedRes = JSON.parse(res);

            const [commentKey, commentValue] = Object.entries(parsedRes.comments)[0];

            console.log("🚀 ~ socket.on ~ commentKey, commentValue:", commentKey, commentValue);
            try {
                await collection.updateOne({ _id: ObjectId.createFromHexString(parsedRes._id) }
                    , { $set: { [`comments.${commentKey}`]: commentValue } });
                socket.broadcast.to(myRoom).emit("comment-change", parsedRes);
            } catch (e) {
                console.error("Error updating document:", e);
            }
        });
        socket.on("comment-delete", async (res) => {
            const parsedRes = JSON.parse(res);

            try {
                await collection.updateOne(
                    { _id: new ObjectId(parsedRes._id) },
                    { $unset: { [`comments.${parsedRes.comments}`]: "" } }
                );
                const res = await collection.findOne({ _id: new ObjectId(parsedRes._id) });

                socket.to(myRoom).emit("doc_update", res);
            } catch (e) {
                console.error("Error updating document:", e);
            }
        });
    };
}
