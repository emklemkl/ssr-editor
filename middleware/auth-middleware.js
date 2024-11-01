// const userIsAuthenticated = (req, res, next) => {
//     console.log("Sessionens användar-ID:", req.session.userId); // Logga sessionens ID
//     if (req.session.userId) {
//         req.user = { _id: req.session.userId }; // Sätt req.user med användarens ID
//         console.log("Authenticated user /middleware:", req.user); // Logga användaren för felsökning
//         return next();
//     }
//     res.status(401).json({ message: 'Ej autentiserad' });
// };
import { ObjectId } from 'mongodb';
import { connectDb, getCollection } from '../data/database.js'; 

const userIsAuthenticated = async (req, res, next) => {
    console.log("Sessionens användar-ID:", req.session.userId);

    if (req.session.userId) {
        try {
            // Hämta användarens fullständiga objekt från databasen
            const db = await connectDb();
            const collection = await getCollection(db, "users");
            const user = await collection.findOne({ _id: new ObjectId(req.session.userId) });

            if (!user) {
                console.error("Användare inte hittad");
                return res.status(401).json({ message: 'Ej autentiserad' });
            }

            // Lägg till hela användarobjektet till req.user
            req.user = { _id: user._id, email: user.email }; 
            console.log("Authenticated user /middleware:", req.user); // Logga användaren för felsökning
            return next();

        } catch (error) {
            console.error("Fel vid hämtning av användare:", error);
            return res.status(500).json({ message: 'Serverfel vid autentisering' });
        }
    }

    res.status(401).json({ message: 'Ej autentiserad' });
};




export { userIsAuthenticated };

