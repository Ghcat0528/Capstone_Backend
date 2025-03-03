const express = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getUserReviews,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing,
  getOtherUserProfile,
} = require("../controllers/userController");

const router = express.Router();

router.get("/profile", authenticateUser, getUserProfile);
router.put("/profile", authenticateUser, updateUserProfile);
router.delete("/profile", authenticateUser, deleteUserProfile )
router.get("/reviews", authenticateUser, getUserReviews);

//following
router.post("/follow/:userId", authenticateUser, followUser);
router.delete("/unfollow/:userId", authenticateUser, unfollowUser);
router.get("/:userId/following", authenticateUser, getFollowing);
router.get("/:userId/isFollowing", authenticateUser, isFollowing);
router.get("/:userId/followers", authenticateUser, getFollowers);
router.get("/:userId/profile", authenticateUser, getOtherUserProfile);

module.exports = router;
