const express = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const {
  getUserProfile,
  updateUserProfile,
  getUserReviews,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getOtherUserProfile,
} = require("../controllers/userController");
const { checkAuth } = require("../middleware/checkAdmin");
const router = express.Router();

router.get("/profile", authenticateUser, getUserProfile);
router.put("/profile", authenticateUser, updateUserProfile);
router.get("/reviews", authenticateUser, getUserReviews);

//following
router.post("/follow/:userId", authenticateUser, followUser);
router.post("/unfollow/:userId", authenticateUser, unfollowUser);
router.get("/:id/followers", authenticateUser, getFollowers);
router.get("/following", authenticateUser, getFollowing);
router.get("/followers", authenticateUser, getFollowers);
router.get("/:id/profile", authenticateUser, getOtherUserProfile);

module.exports = router;
