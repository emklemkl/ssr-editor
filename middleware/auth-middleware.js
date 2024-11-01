import passport from 'passport';

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Ej autentiserad' });
};

export { isAuthenticated };
