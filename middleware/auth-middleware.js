function userIsAuthenticated(req, res, next) {
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