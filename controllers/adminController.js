const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboard = async (req, res) => {
    try{
        const totalUsers = await prisma.user.count();
        const totalGames = await prisma.game.count();
        const totalReviews = await prisma.review.count();

        res.json({
            totalGames,
            totalReviews,
            totalUsers
        });
    } catch (error) {
        res.status(500).json({message: "couldnt get the dashboard"})
    }
};

const getUsers = async (req, res) => {
    try{
        const users = await prisma.user.findMany();
        res.json(users)
    } catch (error) {
        res.status(500).json({ message: "Cant get the users.."})
    }
};

const updateUserRole = async (req, res) => {
    try{
        const {userId} = req.params;
        const {role} = req.body;
        if (role !== 'user' && role !== 'admin') {
            return res.status(400).json({message: "Invalid role, should be user or admin"})
        }
    
    const user = await prisma.user.update({
        where: {id: userId},
        data: {role}
    });
    res.json(user)
} catch (error) {
res.status(500).json({ message: "We couldnt update the user role for you."})
}
};

const deleteUser = async (req, res) => {
    try{
        const { userId} = req.params;
        await prisma.user.delete({
            where: { id: userId}
        });
        res.json({ message: "User deleted!"});
    } catch (error) {
        res.status(500).json({ message: "Couldnt delete that user."})
    }
};

const getGames = async (req, res) => {
    try{ 
        const games = await prisma.game.findMany();
        res.json(games);
    }catch (error) {
        res.status(500).json({ message: "Couldnt get the games."})
    }
};

const createGame = async (req, res) => {
    try{
        const { title, categories, picture} = req.body;
        if (existingCategories.length !== categories.length) {
            return res.status(400).json({ message: "One or more categories are invalid." });
        }
        const newGame = await prisma.game.create({
            data: { 
            title, 
            picture, 
            categories: {connect: categories.map(categoryName => ({ name: categoryName }))}}
        });
        res.status(201).json(newGame);
    } catch (error) {
        res.status(500).json({ message: "Couldnt create game"})
    }
};

const updateGame = async (req, res) => {
    try {
        const {gameId} = req.params;
        const {title, category, picture} = req.body;
        if (existingCategories.length !== categories.length) {
            return res.status(400).json({ message: "One or more categories are invalid." });
        }
        const updateGame = await prisma.game.update({
            where: { id: gameId},
            data: { title,
                 category,
                  picture,
                categories: {
                    set: categories.map(categoryName => ({ name: categoryName }))
                }}
        });
        res.json(updateGame);
    } catch (error) {
        res.status(500).json({ message: "We are having trouble updating that for you..."})
    }
};

const deleteGame = async (req, res) => {
    try{ 
        const { gameId } = req.params;
        await prisma.game.delete({
            where: {id: gameId}
        });
        res.json({ message: "Game deleted!"})
    } catch (error) {
        res.status(500).json({ message: "Couldnt delete the game"})
    }
};

module.exports = {
    getDashboard,
    getUsers,
    updateUserRole,
    deleteUser,
    getGames,
    createGame,
    updateGame,
    deleteGame
};