const express = require("express");
const router = express.Router();
const { checkAdmin } = require("../middleware/checkAdmin");
const adminController = require("../controllers/adminController");

router.get("/dashboard", checkAdmin, adminController.getDashboard);

// User routes
router.get("/users", checkAdmin, adminController.getUsers);
router.put("/users/:userId", checkAdmin, adminController.updateUserRole);
router.delete("/users/:userId", checkAdmin, adminController.deleteUser);

// Game routes
router.get("/games", checkAdmin, adminController.getGames);
router.post("/games", checkAdmin, adminController.createGame);
router.put("/games/:gameId", checkAdmin, adminController.updateGame);
router.delete("/games/:gameId", checkAdmin, adminController.deleteGame);

//reviews
router.get("/reviews", checkAdmin, adminController.getReviews);

// Category routes
router.post("/categories", checkAdmin, adminController.createCategory);
router.put(
  "/categories/:categoryId",
  checkAdmin,
  adminController.updateCategory
);
router.delete(
  "/categories/:categoryId",
  checkAdmin,
  adminController.deleteCategory
);

module.exports = router;
