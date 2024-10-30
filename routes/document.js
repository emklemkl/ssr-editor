import express from "express";
import {ObjectId} from "mongodb";
import { connectDb, getCollection } from './../data/database.js';
import { userIsAuthenticated } from "../middleware/auth-middleware.js";
const router = express.Router();
import transporter from '../config/mail-config.js'

router.post("/create", userIsAuthenticated, async (req, res) => {
    try {
        console.log("User ID (create):", req.user._id);
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

// router.put("/update", userIsAuthenticated, async (req, res) => {
//     try {
//         const { _id, ...rest } = req.body;
//         let db = await connectDb();
//         const collection = await getCollection(db, "crowd");

//         const document = await collection.findOne({_id: new ObjectId(), userId: req.user._id});
//         if (!document) {
//             return res.status(403).send({error: "You are not authorized  to update this document"})
//         }

//         await collection.updateOne({ _id: ObjectId.createFromHexString(_id) }, { $set: rest });
//         return res.status(204).send();
//     } catch (error) {
//         return res.status(500).send({ error: "Failed to update document" });
//     }
// });
router.put("/update", userIsAuthenticated, async (req, res) => {
    try {
        const { _id, ...rest } = req.body;
        
        if (!_id) {
            return res.status(400).send({ error: "Document ID is required" });
        }

        let db = await connectDb();
        const collection = await getCollection(db, "crowd");


        console.log("Update/", req.body);
        await collection.updateOne({ _id: ObjectId.createFromHexString(_id) }, { $set: rest });

        // Hämta det existerande dokumentet
        const document = await collection.findOne({ _id: new ObjectId(_id), userId: req.user._id });
        
        if (!document) {
            return res.status(403).send({ error: "You are not authorized to update this document" });
        }

        // Bevara ownerId om det redan finns
        const updatedDocument = {
            ...rest,
            ownerId: document.ownerId || req.user._id,  // Bevara befintlig ownerId
        };

        const currentEditors = document.editors || [];

        // await collection.updateOne(
        //     { _id: new ObjectId(_id) },
        //     { $set: { updatedDocument }, $set: { editors: currentEditors } }
        // );

        return res.status(204).send();
    } catch (error) {
        console.error("Error updating document:", error);
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

// router.get('/:id/edit', userIsAuthenticated, async (req, res) => {
//     const { id } = req.params;
//     const userEmail = req.user.email;
    
//     let db = await connectDb();
//     const collection = await getCollection(db, "crowd");
//     const document = await collection.findOne({ _id: new ObjectId(id) });
//     if (!document) {
//         return res.status(404).send({ error: "Document not found" });
//     }

//     if (document && (document.ownerId.equals(req.user._id) || document.editors.includes(userEmail))) {
//         res.status(200).send(document);
//     } else {
//         res.status(403).send({ error: "Du har inte behörighet att redigera det här dokumentet." });
//     }
// });

router.get('/:id/edit', userIsAuthenticated, async (req, res) => {
    const { id } = req.params;
    const userEmail = req.user.email;
    console.log("User email:", userEmail);
    
    let db = await connectDb();
    const collection = await getCollection(db, "crowd");

    try {
        const document = await collection.findOne({ _id: new ObjectId(id) });
        if (!document) {
            return res.status(404).send({ error: "Document not found" });
        }
        console.log("Document editors:", document.editors);
        console.log("Document owner:", document.ownerId);
        
        // Kontrollera om användaren är ägaren eller en inbjuden redigerare
        const hasAccess = document.ownerId.equals(req.user._id) || document.editors.includes(userEmail);
        if (hasAccess) {
            return res.status(200).send(document);
        } else {
            return res.status(403).send({ error: "Du har inte behörighet att redigera det här dokumentet." });
        }
    } catch (error) {
        console.error("Error fetching document:", error);
        res.status(500).send({ error: "Internal server error" });
    }
});

// router.get('/:id', userIsAuthenticated, async (req, res) => {
//     try {
//         let db = await connectDb();
//         const collection = await getCollection(db, "crowd");
//         const result = await collection.findOne({ _id: new ObjectId(req.params.id), userId: req.user._id });

//         if(!result) {
//             return res.status(404).send({error: "You don't have access to the document"});
//         }

//         res.status(200).json(result);
//     } catch (error) {
//         res.status(404).send({ error: "Document not found" });
//     }
// });
router.get('/:id', userIsAuthenticated, async (req, res) => {
    try {
        let db = await connectDb();
        const collection = await getCollection(db, "crowd");

        // Hämta dokumentet baserat på ID och säkerställ att användaren har tillgång
        const result = await collection.findOne({ _id: new ObjectId(req.params.id), 
            $or: [
                { userId: req.user._id },
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


// router.post('/:id/invite', userIsAuthenticated, async (req, res) => {
//     const { email } = req.body;
//     const { id } = req.params;
    
//     if (!ObjectId.isValid(id)) {
//         return res.status(400).send("Invalid document ID format");
//     }

//     try {
//         console.log('Inviting editor:', email);
//         let db = await connectDb();
//         const collection = await getCollection(db, "crowd");
//         console.log("Owner ID:", req.user._id);

//         // console.log("User ID:", req.user._id);
//         console.log("Document ID:", req.params.id);
//         console.log("Current User ID:", req.user._id);

//         const document = await collection.findOne({ _id: new ObjectId(req.params.id), ownerId: req.user._id });
//         console.log('Fetched Document:', document);
 
//         if (!document) {
//             console.log("Document ownerId:", document.ownerId);
//             console.log("Document editors:", document.editors);
//             console.log("User does not have permission to share this document.");
//             return res.status(403).send({ error: "You don't have permission to share this document." });
//         }

//         console.log('Current Editors:', document.editors);

//         if (document.editors && document.editors.includes(email)) {
//             return res.status(400).send({ error: "Email is already an editor." });
//         }

//         const updateResult = await collection.updateOne(
//             { _id: new ObjectId(req.params.id) },
//             { $addToSet: { editors: email } }
//         );

//         console.log('Update Result:', updateResult);

//         if (updateResult.modifiedCount === 0) {
//             return res.status(400).send({ error: "Could not update document." });
//         }
router.post('/:id/invite', userIsAuthenticated, async (req, res) => {
    const { email } = req.body;  // Se till att e-postadressen kommer från begäran
    const { id } = req.params;
    
    try {
        let db = await connectDb();
        const collection = await getCollection(db, "crowd");

        // Hämta dokumentet
        const document = await collection.findOne({ _id: new ObjectId(id) });
        
        // Kontrollera äganderätt
        if (!document || !document.ownerId.equals(req.user._id)) {
            return res.status(403).send({ error: "User does not have permission to share this document." });
        }

        // Kolla om e-postadressen redan finns i editors
        if (!document.editors.includes(email)) {
            // Lägg till e-postadressen till editors
            await collection.updateOne(
                { _id: new ObjectId(id) },
                { $addToSet: { editors: email } }  // Använd $addToSet för att undvika dubbletter
            );
        }
        
        // const inviteLink = `http://localhost:5000/auth/google?redirect=${encodeURIComponent(`http://localhost:4200/document/${document._id}/edit`)}`;
        const inviteLink = `http://localhost:4200/document/${document._id}/edit`;

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
