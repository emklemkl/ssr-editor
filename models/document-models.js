import { ObjectId } from 'mongodb';
import { connectDb, getCollection } from '../data/database.js'; // Importera din databasmodul

// Hämta databasen och `user`-kollektionen
export async function getDocumentCollection() {
    const db = await connectDb();
    return getCollection(db, 'crowd'); // Anta att kollektionen heter 'user'
}


