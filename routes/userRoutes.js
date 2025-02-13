const express = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const {
    getUserProfile,
    updateUserProfile,
    getUserReviews
} = require("../controllers/userController");
const router = express.Router();


router.get("/profile", authenticateUser, getUserProfile);
router.put("/profile", authenticateUser, updateUserProfile);
router.get("/reviews", authenticateUser, getUserReviews);

module.exports = router;