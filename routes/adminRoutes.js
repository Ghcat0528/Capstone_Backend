const express = require("express");
const router = express.Router();
const { checkAdmin } = require("../middleware/checkAdmin");
const { getDashboard,
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
    deleteCategory,} = require("../controllers/adminController");

router.get("/dashboard", checkAdmin, getDashboard);
//user routes
router.get("/users", checkAdmin, getUsers);
router.put("/:userId/role", checkAdmin, updateUserRole);
router.delete("/:userId", checkAdmin, deleteUser);
//Game routes
router.get("/games/:gameId", checkAdmin, getGames);
router.post("/games/:gameId", checkAdmin, createGame);
router.put("/games/:gameId", checkAdmin, updateGame);
router.delete("/games/:gameId", checkAdmin, deleteGame);

// Similarly for reviews and categories
router.get("/reviews", checkAdmin, getReviews);
router.delete("/review/:reviewId", checkAdmin, adminDeleteReview);

router.post("/categories", checkAdmin, createCategory);
router.put("/categories/:categoryId", checkAdmin, updateCategory);
router.delete("/categories/:categoryId", checkAdmin, deleteCategory);
module.exports = router;
