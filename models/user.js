import { ObjectId } from 'mongodb';
import { connectDb, getCollection } from '../data/database.js'; // Importera din databasmodul

// Hämta databasen och `user`-kollektionen
export async function getUserCollection() {
    const db = await connectDb();
    return getCollection(db, 'users'); // Anta att kollektionen heter 'user'
}

export async function getUserById(id) {
    const userCollection = await getUserCollection();
    return await userCollection.findOne({ _id: new ObjectId(id) });
}

export async function getUserByEmail(email) {
    const userCollection = await getUserCollection();
    return await userCollection.findOne({ email });
}

// Funktion för att spara användaren i databasen
export async function saveUser(userData) {
    const userCollection = await getUserCollection();
    const newUser = { ...userData };

    try {
        // Kontrollera om användaren redan finns baserat på t.ex. e-post
        const existingUser = await userCollection.findOne({ email: newUser.email });
        if (existingUser) {
            throw new Error('Användaren finns redan.');
        }

        const result = await userCollection.insertOne(newUser);
        
        // Om du använder en nyare MongoDB-drivrutin, kan du returnera så här
        return { id: result.insertedId, ...newUser };
        
    } catch (error) {
        // Logga hela felet för att fånga mer detaljer vid problem
        console.error('Kunde inte spara användaren:', error);
        throw new Error('Kunde inte spara användaren: ' + error.message);
    }
}
