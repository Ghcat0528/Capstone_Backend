const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');






const createReview = async (req, res) => {
    try{ 
        const { gameId, rating, content } = req.body
        const userId = req.user.id;
        const existingReview = await prisma.review.findFirst({
            where: { gameId, userId}
        });
        if (existingReview) {
            return res.status(400).json({ message: "You reviewed that game already" });
        }
        const review = await prisma.review.create({ 
            data: {gameId, userId, rating, content}
        });
        res.status(201).json(review)
    } catch (error) {
        res.status(500).json({ message: " DIdnt create review"});
    }
};


const getReviewsByGame = async (req, res) => {
    try { 
        const {gameId} = req.params;
        const reviews = await prisma.review.findMany({
            where: { gameId},
            include: { user: { select: { id: true, username: true}}}
        });
        res.json(reviews);

    } catch (error) {
        res.status(500).json({ message: "Couldn't get reviews...."})
    }
};

const getUserReviews = async (req, res) => {
    try{ 
        const userId= req.user.id
        const reviews = await prisma.review.findMany({
            where: {userId},
            include: { game: { select: { id: true, title: true}}}
        });
        res.json(reviews)
    } catch (error) {
        res.status(500).json({ message: "We didn't get your reviews"})
    }
};

const updateReview = async (req, res) => {
    try{
        const reviewId = parseInt(req.params.reviewId);
        const { rating, content} = req.body;
        const userId = req.user.id;
        const review = await prisma.review.findUnique({
            where: { id: reviewId}
        });
        if (!review || review.userId !== userId) {
            return res.status(403).json({ message: "Not authorized to edit"});
        }
        const updatedReview = await prisma.review.update({
            where: { id: reviewId},
            data: { rating, content}
        });
        res.json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: "We couldnt update that for you"});
    }
};

const deleteReview = async (req, res) => {
    try{ 
        const reviewId = parseInt(req.params.reviewId);
        const userId = req.user.id;

        const review = await prisma.review.findUnique({
            where: { id: reviewId}
        });
        if (!review || review.userId !== userId) {
            return res.status(403).json({ message: "Not authorized to delete"})
        }
        await prisma.review.delete({
            where: { id: reviewId}
        });
        res.json({ message: "You deleted the review!"});

    } catch (error) {
        res.status(500).json({ message: "Didnt delete the review"});
    }
};

module.exports = {
    createReview,
    getReviewsByGame,
    getUserReviews,
    updateReview,
    deleteReview
};