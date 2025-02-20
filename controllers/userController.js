const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true },
    });
    if (!user) {
      return res.status(404).json({ error: "We dont have that user" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Couldnt fetch profile" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name, email },
    });
    res.json({ message: "Profile updated!", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "couldnt update your profile :(" });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.user.userId },
      include: { game: true },
    });
    res.json(reviews);
  } catch (error) {
    res
      .status(500)
      .json({ error: "We're having a hard time fetching reviews right now" });
  }
};
//following

const followUser = async (req, res) => {
  const loggedInUserId = req.user.userId;
  const { userId } = req.params;

  if (loggedInUserId === userId) {
    return res.status(400).json({ message: "You can't follow yourself." });
  }

  try {
    const userToFollow = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found." });
    }
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: loggedInUserId,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      return res
        .status(400)
        .json({ message: "You are already following this user." });
    }

    await prisma.userFollow.create({
      data: {
        followerId: loggedInUserId,
        followingId: userId,
      },
    });

    res.status(200).json({ message: "Followed this user!" });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ message: "Couldn't follow that user :(" });
  }
};

const unfollowUser = async (req, res) => {
  const loggedInUserId = req.user.userId;
  const { userId } = req.params;
  if (loggedInUserId === userId) {
    return res.status(400).json({ message: "You can't unfollow yourself." });
  }

  try {
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: loggedInUserId,
          followingId: userId,
        },
      },
    });

    if (!existingFollow) {
      return res
        .status(400)
        .json({ message: "You can't unfollow a user you're not following." });
    }
    await prisma.userFollow.delete({
      where: {
        followerId_followingId: {
          followerId: loggedInUserId,
          followingId: userId,
        },
      },
    });

    res.status(200).json({ message: "Unfollowed!" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ message: "We couldn't unfollow the user for you." });
  }
};

const getFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    const followers = await prisma.userFollow.findMany({
      where: { followingId: id },
      include: { follower: true },
    });

    res.json(followers.map((f) => f.follower));
  } catch (error) {
    console.error("Error getting followers:", error);
    res.status(500).json({ error: "We couldn't get the followers." });
  }
};

const getFollowing = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const following = await prisma.userFollow.findMany({
      where: { followerId: currentUserId },
      include: { following: true },
    });

    res.json(following.map((f) => f.following));
  } catch (error) {
    console.error("Error getting following:", error);
    res.status(500).json({ message: "Could not get who you're following." });
  }
};
const getOtherUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        reviews: { include: { game: true } },
        followers: {
          select: { follower: { select: { id: true, name: true } } },
        },
        following: {
          select: { following: { select: { id: true, name: true } } },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found..." });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res
      .status(500)
      .json({ error: "We are having a difficult time getting that profile" });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserReviews,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getOtherUserProfile,
};
