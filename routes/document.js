import express from "express";
import {ObjectId} from "mongodb";
import { connectDb, getCollection } from './../data/database.js';
import { userIsAuthenticated } from "../middleware/auth-middleware.js";
const router = express.Router();
import transporter from '../config/mail-config.js'
import 'dotenv/config';
import { getDocumentCollection } from "../models/document-models.js";

router.post("/create", userIsAuthenticated, async (req, res) => {
    console.log("Authenticated user in /create route:", req.user); // Logga för att kontrollera användarinformation

    try {
        if (!req.user) {
            // Kolla om req.user är undefined
            console.error("User is not authenticated.");
            return res.status(401).send({ error: "Ej autentiserad" });
        }
        
        const document = { ...req.body,
            userId: req.user.id,
            ownerId: req.user.id,
            editors: []
        };

        const collection = await getDocumentCollection();;
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
        
        if (!_id) {
            return res.status(400).send({ error: "Document ID is required" });
        }

        const collection = await getDocumentCollection();


        console.log("Update/", req.body);
        await collection.updateOne({ _id: ObjectId.createFromHexString(_id) }, { $set: rest });

        // Hämta det existerande dokumentet
        const document = await collection.findOne({ _id: new ObjectId(_id), userId: req.user._id });
        
        if (!document) {
            return res.status(403).send({ error: "You are not authorized to update this document" });
        }

        const updatedDocument = {
            ...rest,
            ownerId: document.ownerId || req.user._id,  // Bevara befintlig ownerId
            editors:  document.editors || []
        };


        await collection.updateOne(
            { _id: new ObjectId(_id) },
            { $set: updatedDocument }
        );

        return res.status(204).send();
    } catch (error) {
        console.error("Error updating document:", error);
        return res.status(500).send({ error: "Failed to update document" });
    }
});

router.get("/all", userIsAuthenticated, async (req, res) => {
    console.log("Authenticated user /all:", req.user);
    console.log("Authenticated user /all - mail:", req.user.email);
    try {
        const collection = await getDocumentCollection();

        console.log("Querying documents for user:", {
            ownerId: req.user.id,
            editors: req.user.email,
        });

        const documents = await collection.find({
            $or: [
                { ownerId: req.user.id },       
                { editors: req.user.email }
            ]
        }).toArray();
        // Logga de hämtade dokumenten
        console.log("Fetched documents:", documents);

        return res.status(200).json(documents);
    } catch (error) {
        console.error("Error fetching documents:", error);
        return res.status(500).send({ error: "Failed to fetch documents" });
    }
});

router.get('/:id', userIsAuthenticated, async (req, res) => {
    try {
        const collection = await getDocumentCollection();

        const result = await collection.findOne({ _id: new ObjectId(req.params.id), 
            $or: [
                { userId: req.user.id },
                { editors: req.user.email }
            ]
        });

        if (!result) {
            return res.status(404).send({ error: "You don't have access to the document" });
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).send({ error: "Failed to fetch document" });
    }
});

router.post('/:id/invite', userIsAuthenticated, async (req, res) => {
    const { email } = req.body;
    const { id } = req.params;
    console.log('Email /invite: ', email);
    console.log('Doc id /invite: ', id);

    try {
        const collection = await getDocumentCollection();

        const document = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!document) {
            return res.status(404).send({ error: "Document not found." });
        }

        // Kontrollera och konvertera ownerId om det inte är av typen ObjectId
        const ownerId = typeof document.ownerId === 'string' ? new ObjectId(document.ownerId) : document.ownerId;
        console.log('owner id /ivite: ', ownerId);
        
        
        if (!ownerId.equals(req.user.id)) {
            return res.status(403).send({ error: "User does not have permission to share this document." });
        }

        if (!document.editors.includes(email)) {
            await collection.updateOne(
                { _id: new ObjectId(id) },
                { $addToSet: { editors: email } }
            );
        }
        
        const inviteLink = `http://localhost:4200/register?redirect=${encodeURIComponent(`http://localhost:5000/document/${document._id}`)}`;
        // const inviteLink = `${process.env.BASE_URL}/register?redirect=${encodeURIComponent(`${process.env.BASE_URL}/document/${document._id}`)}`;

        const mailOptions = {
            from: 'pulseproject23bth@gmail.com',
            to: email,
            subject: 'Invitation to Edit Document',
            text: `You have been invited to edit the document titled "${document.title}".
            You can access it here: ${inviteLink}`
        };
        
        await transporter.sendMail(mailOptions);

        res.status(200).send({ message: 'Invitation sent successfully!' });
    } catch (error) {
        console.error("Error inviting editor:", error);
        res.status(500).send({ error: "An error occurred while inviting the editor." });
    }   
});


export default router;
