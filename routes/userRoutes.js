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
    getOtherUserProfile
} = require("../controllers/userController");
const checkAuth = require()
const router = express.Router();


router.get("/profile", authenticateUser, getUserProfile);
router.put("/profile", authenticateUser, updateUserProfile);
router.get("/reviews", authenticateUser, getUserReviews);

//following
router.post('/follow/:userId', checkAuth, followUser);
router.post('/unfollow/:userId', checkAuth, unfollowUser);
router.get('/:id/followers', authenticateUser, getFollowers);
router.get('/following', checkAuth, getFollowing);
router.get('/:id/profile', authenticateUser, getOtherUserProfile);


module.exports = router;