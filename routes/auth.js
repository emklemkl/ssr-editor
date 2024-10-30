import express from "express";
import config from '../config/auth-config.js';
import { userIsAuthenticated, isLoggedIn } from '../middleware/auth-middleware.js';

const passport = config;
const router = express.Router();

router.get('/', (req, res) => {
    res.send('<a href="/auth/google">Authenticate with Google</a>');
});

router.get('/auth/google', (req, res,) => {
    const redirect = req.query.redirect || '/';
    passport.authenticate('google', { 
        scope: ['email',  'profile'],
        state: encodeURIComponent(redirect)
     })(req, res);
});

router.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/',
    }),

    (req, res) => {
    if (req.isAuthenticated()) {
        console.log('Received redirect query:', req.query.redirect);
        const redirectUrl = req.query.redirect || 'http://localhost:4200';
        console.log('Received redirect query:', req.query.redirect);
        console.log('!!!Redirecting to:', redirectUrl);
        res.redirect(redirectUrl);
    } else {
        res.redirect('/login');
    }
});

router.get('/auth/failure', (req, res) => {
    res.send('something went wrong');
})

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
    });
})

export default router;
