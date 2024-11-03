import { Router } from 'express';
import { hashPassword, verifyPassword } from '../services/auth-service.js';
import { getUserById, getUserByEmail, saveUser } from '../models/user-models.js';
import { userIsAuthenticated } from '../middleware/auth-middleware.js';
import jwt from 'jsonwebtoken'; // Importera jwt
import 'dotenv/config';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Registrera användare
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await hashPassword(password);
        await saveUser({ email, password: hashedPassword }); // Spara användaren i databasen
        res.status(201).json({ message: 'Användare registrerad!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Något gick fel vid registreringen' });
    }
  });

// Logga in användare
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
    
  const user = await getUserByEmail(email);
  if (!user) {
      return res.status(401).json({ message: 'Ogiltigt användarnamn eller lösenord' });
  }

  const validUser = await verifyPassword(password, user.password);
  if (validUser) {
      const token = jwt.sign(
        { id: user._id, email: user.email }, 
        JWT_SECRET, 
        { expiresIn: '1h' }); // Skapa en JWT-token
      res.json({ token, redirectUrl: 'http://localhost:4200/' });
  } else {
      res.status(401).json({ message: 'Ogiltigt användarnamn eller lösenord' });
  }
});

router.get('/me', userIsAuthenticated, async (req, res) => {
  const user = await getUserById(req.user.id); // Hämta användare med ID från JWT
  
  if (!user) {
      return res.status(404).json({ message: "Användaren hittades inte" });
  }

    res.json({ email: user.email });
});

// Logga ut användare
router.post('/logout', (req, res) => {
      res.json({ message: 'Utloggning lyckades' });
});

export default router;
