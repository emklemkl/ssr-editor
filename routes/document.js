import express from "express";
import {ObjectId} from "mongodb";
import { connectDb, getCollection } from './../data/database.js';
import { userIsAuthenticated } from "../middleware/auth-middleware.js";
const router = express.Router();
import transporter from '../config/mail-config.js'

router.post("/create", userIsAuthenticated, async (req, res) => {
    try {
        const document = { ...req.body,
            userId: req.user._id,
            ownerId: req.user._id,
            editors: []
        };
        let db = await connectDb();
        const collection = await getCollection(db, "crowd");
        const result = await collection.insertOne(document);
        console.log('Inserted document ID:', result.insertedId);

        return res.status(201).send({
            message: "Document created successfully", _id: result.insertedId
        });
    } catch (error) {
        return res.status(500).send({ error: "Failed to create document" });
    }
});

router.put("/update", userIsAuthenticated, async (req, res) => {
    try {
        const { _id, ...rest } = req.body;
        let db = await connectDb();
        const collection = await getCollection(db, "crowd");

        const document = await collection.findOne({_id: new ObjectId(), userId: req.user._id});
        if (!document) {
            return res.status(403).send({error: "You are not authorized  to update this document"})
        }

        await collection.updateOne({ _id: ObjectId.createFromHexString(_id) }, { $set: rest });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).send({ error: "Failed to update document" });
    }
});

router.get('/all', userIsAuthenticated, async (req, res) => {
    console.log("Authenticated user:", req.user);
    
    let db = await connectDb();
    const collection = await getCollection(db, "crowd");
    const result = await collection.find({userId: req.user._id}).toArray();

    res.status(200).json(result);
});

router.get('/:id', userIsAuthenticated, async (req, res) => {
    try {
        let db = await connectDb();
        const collection = await getCollection(db, "crowd");
        const result = await collection.findOne({ _id: new ObjectId(req.params.id), userId: req.user._id });

        if(!result) {
            return res.status(404).send({error: "You don't have access to the document"});
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(404).send({ error: "Document not found" });
    }
});

router.post('/:id/invite', userIsAuthenticated, async (req, res) => {
    const { email } = req.body;
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Invalid document ID format");
    }

    try {
        console.log('Inviting editor:', email);
        let db = await connectDb();
        const collection = await getCollection(db, "crowd");
        console.log("User ID (owner):", req.user._id);
        // console.log("Document Owner ID:", document.ownerID);


        // console.log("User ID:", req.user._id);
        console.log("Document ID:", req.params.id);

        // Hämta dokumentet
        const document = await collection.findOne({ _id: new ObjectId(req.params.id), ownerId: req.user._id });
        console.log('Fetched Document:', document);
        // console.log("Document Owner ID:", document.ownerId);
        // Kontrollera om dokumentet existerar
        if (!document) {
            console.log("User does not have permission to share this document.");
            return res.status(403).send({ error: "You don't have permission to share this document." });
        }

        // Logga editors-listan
        console.log('Current Editors:', document.editors);

        // Kontrollera om e-posten redan finns i editors-listan
        if (document.editors && document.editors.includes(email)) {
            return res.status(400).send({ error: "Email is already an editor." });
        }

        // Uppdatera editors-listan
        const updateResult = await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $addToSet: { editors: email } }
        );

        console.log('Update Result:', updateResult);

        if (updateResult.modifiedCount === 0) {
            return res.status(400).send({ error: "Could not update document." });
        }

        // Skicka e-postinbjudan
        const mailOptions = {
            from: 'pulseproject23bth@gmail.com',
            to: email,
            subject: 'Invitation to Edit Document',
            text: `You have been invited to edit the document titled "${document.title}".
            You can access it here: http://localhost:4200/document/view/${document._id}`
        };
        await transporter.sendMail(mailOptions);

        res.status(200).send({ message: 'Invitation sent successfully!' });
    } catch (error) {
        console.error("Error inviting editor:", error);
        res.status(500).send({ error: "An error occurred while inviting the editor." });
    }
});


export default router;
