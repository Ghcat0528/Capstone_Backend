const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getUserProfile = async (req, res) => {
    try{
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId},
            select: { id: true, name: true, email: true}
        });
        if (!user) {
            return res.status(404).json({ error: "We dont have that user"})
        }
        res.json(user)
    } catch (error) {
        res.status(500).json({ error: "Couldnt fetch profile"})
    }
};

const updateUserProfile = async (req, res) => {
    try{
        const { name, email } = req.body;
        const updatedUser = await prisma.user.update({
            where: { id: req.user.userId},
            data: { name, email}
        });
        res.json({ message: "Profile updated!", user: updatedUser});
    } catch (error) {
        res.status(500).json({ error: "couldnt update your profile :("})
    }
};

const getUserReviews = async (req, res) => {
    try{
        const reviews = await prisma.review.findMany({
            where: { userId: req.user.userId},
            include: { game: true}
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: "We're having a hard time fetching reviews right now"})
    }
};

module.exports = { 
    getUserProfile,
    updateUserProfile,
    getUserReviews };



