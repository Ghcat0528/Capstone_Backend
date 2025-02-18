


const checkAdmin = (req, res, next) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};
const checkAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
};

module.exports = {checkAdmin, checkAuth};