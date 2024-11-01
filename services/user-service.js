export async function createUser(userData) {
    try {
        const userCollection = await getUserCollection();
        const result = await userCollection.insertOne(userData); // Lägg till användaren
        console.log('Användare sparad:', result.insertedId);
        return result.insertedId;
    } catch (error) {
        console.error('Misslyckades att spara användaren:', error);
        throw new Error('Database error');
    }
};

