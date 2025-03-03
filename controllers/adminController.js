const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getDashboard = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalGames = await prisma.game.count();
    const totalReviews = await prisma.review.count();

    res.json({
      totalGames,
      totalReviews,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: "couldnt get the dashboard" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Cant get the users.." });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (role !== "user" && role !== "admin") {
      return res
        .status(400)
        .json({ message: "Invalid role, should be user or admin" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "We couldnt update the user role for you." });
  }
};

const deleteUser = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Ensure the logged-in user is an admin (assuming req.user.role exists)
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "You do not have permission to delete this user" });
      }
  
      // Optionally: Check if the user to be deleted exists
      const userToDelete = await prisma.user.findUnique({
        where: { id: userId },
      });
  
      if (!userToDelete) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Delete related data (e.g., reviews, followers, and following) for this user
      await prisma.review.deleteMany({
        where: { userId: userId }, // Delete all reviews by this user
      });
  
      await prisma.follower.deleteMany({
        where: { followerId: userId }, // Delete all follower records for this user
      });
  
      await prisma.following.deleteMany({
        where: { followingId: userId }, // Delete all following records for this user
      });
  
      // Finally, delete the user
      await prisma.user.delete({
        where: { id: userId },
      });
  
      res.json({ message: "User deleted successfully!" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Could not delete that user." });
    }
  };
  
const getGames = async (req, res) => {
  try {
    const games = await prisma.game.findMany();
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: "Couldnt get the games." });
  }
};

const createGame = async (req, res) => {
  try {
    const { title, categories, picture } = req.body;
    const existingCategories = await prisma.category.findMany({
      where: {
        name: { in: categories },
      },
    });
    if (existingCategories.length !== categories.length) {
      return res
        .status(400)
        .json({ message: "One or more categories are invalid." });
    }
    const newGame = await prisma.game.create({
      data: {
        title,
        picture,
        categories: {
          connect: categories.map((categoryName) => ({ name: categoryName })),
        },
      },
    });
    res.status(201).json(newGame);
  } catch (error) {
    res.status(500).json({ message: "Couldnt create game" });
  }
};

const updateGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { title, category, picture } = req.body;
    const existingCategories = await prisma.category.findMany({
      where: {
        name: { in: categories },
      },
    });
    if (existingCategories.length !== categories.length) {
      return res
        .status(400)
        .json({ message: "One or more categories are invalid." });
    }
    const updateGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        title,
        category,
        picture,
        categories: {
          set: categories.map((categoryName) => ({ name: categoryName })),
        },
      },
    });
    res.json(updateGame);
  } catch (error) {
    res
      .status(500)
      .json({ message: "We are having trouble updating that for you..." });
  }
};

const deleteGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    await prisma.game.delete({
      where: { id: gameId },
    });
    res.json({ message: "Game deleted!" });
  } catch (error) {
    res.status(500).json({ message: "Couldnt delete the game" });
  }
};
//reviews
const getReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        game: true,
        user: true,
      },
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
};

const adminDeleteReview = async (req, res) => {
    const { reviewId } = req.params; 
    if (!reviewId) {
        return res.status(400).json({ error: "Review ID is required" });
    }

    try {
        const review = await prisma.review.findUnique({
            where: { id: reviewId } 
        });
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        await prisma.review.delete({
            where: { id: reviewId } 
        });

        res.status(200).json({ message: 'Review deleted successfully!' });
    } catch (error) {
        
        res.status(500).json({ error: 'We couldnt delete the review' });
    }
};
    


// categories
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = await prisma.category.create({
      data: { name },
    });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: "Could not create category" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { name },
    });
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: "Could not update category" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    await prisma.category.delete({
      where: { id: categoryId },
    });
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete category" });
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
  deleteGame,
  getReviews,
  adminDeleteReview,
  createCategory,
  updateCategory,
  deleteCategory,
};
