const userIsAuthenticated = (req, res, next) => {
    console.log("Sessionens användar-ID:", req.session.userId); // Logga sessionens ID
    if (req.session.userId) {
        req.user = { _id: req.session.userId }; // Sätt req.user med användarens ID
        console.log("Authenticated user /middleware:", req.user); // Logga användaren för felsökning
        return next();
    }
    res.status(401).json({ message: 'Ej autentiserad' });
};


export { userIsAuthenticated };

