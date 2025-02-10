const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');
const {
    createReview,
    getReviewsByGame,
    getUserReviews,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');

const router = express.Router();


router.post('/', authenticateUser, createReview);
router.get('/game/:gameId', getReviewsByGame);
router.get('/user', authenticateUser, getUserReviews);
router.put('/:reviewId', authenticateUser, updateReview);
router.delete('/:reviewId', authenticateUser, deleteReview);

module.exports = router;