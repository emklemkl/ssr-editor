import express from "express";
import config from '../config/auth-config.js';
import { isLoggedIn } from '../middleware/auth-middleware.js'
const passport = config;
const router = express.Router();

router.get('/', (req, res) => {
    res.send('<a href="/auth/google">Authenticate with Google</a>');
});

router.get('/auth/google',
    passport.authenticate('google', { scope: ['email',  'profile'] })
);

router.get('/auth/google/callback',
    passport.authenticate('google', {
        // successRedirect: '/protected',
        // failureRedirect: 'auth/failure',
        failureRedirect: '/',
    }),

    (req, res) => {
        req.login(req.user, (err) => {
            console.log('Authenticated user:', req.user);
            console.log('Session after login:', req.session);
            if (err) return res.status(500).send('Error logging in user');
            res.redirect('http://localhost:4200');
        })
    }
);

router.get('/auth/failure', (req, res) => {
    res.send('something went wrong');
})

router.get('/protected', isLoggedIn, (req, res) => {
    res.send(`Hello ${req.user.displayName}`);
});

router.get('/current_user', (req,res) => {
    console.log("Current user endpoint hit");
    console.log("User is authenticated:", req.isAuthenticated());
    console.log("Session:", req.session);
    if (req.isAuthenticated()) {
        res.send(req.user);
    } else {
        console.log("User not authenticated");
        res.status(401).send({ error: "Not authenticated"})
    }
});

router.get('/logout', (req, res, next) => {
    console.log('user to logout:', req.user);
    req.logout((err) => {
        if (err) { return next(err);}
        req.session.destroy();
        res.send('');
        // res.redirect('http://localhost:4200/login')
    });
})

export default router;