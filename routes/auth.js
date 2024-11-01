import { Router } from 'express';
import { hashPassword, verifyPassword } from '../services/auth-service.js';
import { getUserById, getUserByEmail, saveUser } from '../models/user.js';

const router = Router();

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
  
    if (user && await verifyPassword(password, user.password)) {
        // Spara användarens ID i sessionen
        req.session.userId = user._id;
        req.session.usserEmail = user.email;
        console.log("Sparat användar-ID i session:", req.session.userId);
        console.log("Sparat användar-Email i session:", req.session.usserEmail);
        // console.log("Logged in user email:", req.user.email);

    
        res.json({ message: 'Inloggning lyckades', userId: user._id });
      } else {
        res.status(401).json({ message: 'Ogiltigt användarnamn eller lösenord' });
      }
    });

router.get('/me', async (req, res) => {
    console.log("Sessionens användar-ID:", req.session.userId);
    if (!req.session.userId) {
        return res.status(401).json({ message: "Du är inte inloggad" });
    }

    const user = await getUserById(req.session.userId);
    if (!user) {
        return res.status(404).json({ message: "Användaren hittades inte" });
    }

    res.json({ email: user.email });
});


// Rutt för att logga ut
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: 'Kunde inte logga ut' });
      }
      res.json({ message: 'Utloggning lyckades' });
    });
  });

export default router;
