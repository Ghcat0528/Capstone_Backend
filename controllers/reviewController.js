const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

const createReview = async (req, res) => {
  try {
    const { gameId, rating, content } = req.body;
    const userId = req.user?.userId;

    if (!gameId || !rating || !content) {
        return res.status(400).json({ message: "All fields are required" });
      }
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({
          message:
            "Rating needs to be between 1 and 5, where 1 is worst and 5 is best.",
        });
    }
    const existingReview = await prisma.review.findFirst({
      where: { gameId, userId },
    });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You reviewed that game already" });
    }
    const review = await prisma.review.create({
      data: { gameId, userId, rating, content },
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: " DIdnt create review" });
  }
};

const getReviewsByGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameExists = await prisma.game.findUnique({
        where: { id: gameId },
      });
    if (!gameId) {
      return res.status(400).json({ message: "Game ID is required" });
    }
    const reviews = await prisma.review.findMany({
      where: { gameId },
      include: { user: { select: { id: true, name: true } } },
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Couldn't get reviews...." });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true}, 
      });
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: { game: { select: { id: true, title: true } } },
    });
   

    res.status(200).json({ user, reviews });
  } catch (error) {
    res.status(500).json({ message: "We didn't get your reviews" });
  }
};

const updateReview = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const { rating, content } = req.body;
    const userId = req.user.userId;
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({
          message:
            "Rating needs to be between 1 and 5, where 1 is worst and 5 is best.",
        });
    }
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review || review.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to edit" });
    }
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { rating, content },
    });
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: "We couldnt update that for you" });
  }
};

const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const userId = req.user.userId;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review || review.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete" });
    }
    await prisma.review.delete({
      where: { id: reviewId },
    });
    res.json({ message: "You deleted the review!" });
  } catch (error) {
    res.status(500).json({ message: "Didnt delete the review" });
  }
};

//game


const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Couldn't fetch categories" });
    }
};



const getCatGames = async (req, res) => {
    try {
        const { categories } = req.query;

        let games;
        if (categories) {
            const categoryIds = categories.split(',');
            games = await prisma.game.findMany({
                where: {
                    categories: {
                        some: {
                            id: { in: categoryIds }
                        }
                    }
                },
                include: { categories: true }
            });
        } else {
            games = await prisma.game.findMany({ include: { categories: true } });
        }
        res.json(games);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

  
  const getUserGames = async (req, res) => {
    try {
      const games = await prisma.game.findMany();
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: "Couldnt get the games." });
    }
  };

  const getGameDetails = async (req, res) => {
    try {
      const { gameId } = req.params;
      const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
          categories: true,
          reviews: {
            include: {
              user: true,
            }
          }
        }
      });
  
      if (!game) {
        return res.status(404).send('Game not found');
      }
        let averageRating = null;
      if (game.reviews.length > 0) {
        const totalRating = game.reviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = totalRating / game.reviews.length;
      }
        res.json({
        ...game,
        averageRating,
      });
    } catch (error) {
      res.status(500).json({ message: "We couldn't get that game" });
    }
  };
  
module.exports = {
  createReview,
  getReviewsByGame,
  getUserReviews,
  updateReview,
  deleteReview,
  getCategories,
  getCatGames,
  getUserGames,
  getGameDetails,
};
