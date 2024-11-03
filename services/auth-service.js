import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const secretKey = process.env.JWT_SECRET || 'yes';
const saltRounds = 10;

// Generera JWT-token vid inloggning
export function generateToken(userId) {
    return jwt.sign({ userId }, secretKey, { expiresIn: '1h' });
}

export async function hashPassword(password) {
    return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(inputPassword, storedHash) {
    return await bcrypt.compare(inputPassword, storedHash); // Returnerar true eller false
}
