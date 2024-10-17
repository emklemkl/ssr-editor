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

router.get('/google/callback',
    passport.authenticate('google', {
        successRedirect: '/protected',
        failureRedirect: 'auth/failure',
    })
);

router.get('/auth/failure', (req, res) => {
    res.send('something went wrong');
})

router.get('/protected', isLoggedIn, (req, res) => {
    res.send(`Hello ${req.user.displayName}`);
});

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err);}
        req.session.destroy();
        res.send('Godbye');
    });
})

export default router;