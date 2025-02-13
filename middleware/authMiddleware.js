const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Denied access, you didnt give me a token"});

    }
    try{ 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded JWT:", decoded); 
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: "Token... WRONG"});
    }
};

module.exports = {authenticateUser};