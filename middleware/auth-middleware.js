function userIsAuthenticated(req, res, next) {
    console.log("Is Authenticated:", req.isAuthenticated ? req.isAuthenticated() : "No auth method");
    console.log("User Data:", req.user);
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.status(401).send({error: "Unauthorized"});
    }
}
function isLoggedIn(req, res, next) {    
    req.user ? next() : res.sendStatus(401);
}

export {
    isLoggedIn,
    userIsAuthenticated
};