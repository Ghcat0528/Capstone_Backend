const express = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const {
  createReview,
  getReviewsByGame,
  getUserReviews,
  updateReview,
  deleteReview,
  getCategories,
  getCatGames,
  getUserGames,
  getGameDetails
} = require("../controllers/reviewController");

const router = express.Router();

router.post("/", authenticateUser, createReview);
router.get("/game/:gameId", getReviewsByGame);
router.get("/user", authenticateUser, getUserReviews);
router.put("/:reviewId", authenticateUser, updateReview);
router.delete("/:reviewId", authenticateUser, deleteReview);

//games
router.get("/catgames", getCatGames);
router.get('/games', getUserGames);          
router.get("/categories", getCategories); 
router.get('/games/:gameId', getGameDetails);

module.exports = router;
