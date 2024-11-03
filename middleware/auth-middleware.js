import jwt from 'jsonwebtoken';
import 'dotenv/config';

const secretKey = process.env.JWT_SECRET || 'yes';

const userIsAuthenticated = async (req, res, next) => {
    // const authHeader = req.headers['authorization'];
    const token = req.headers.authorization?.split(' ')[1];
    console.log("Token som tas emot:", token); 
    if (!token) {
        return res.status(401).json({ message: 'Ingen token tillhandahölls' });
      }

    jwt.verify(token, secretKey , (err, user) => {
        if (err) {
            console.log("Token verifieringsfel:", err); 
            return res.status(401).json({ message: 'Token är ogiltig' });
        }
        console.log("Dekodad token:", user);
        req.user = user; // Sätt användar-ID i `req.user`
        next();
    });
};




export { userIsAuthenticated };

