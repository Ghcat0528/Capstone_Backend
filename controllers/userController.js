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
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId === userId) {
      return res
        .status(400)
        .json({ message: "You cant follow yourself, silly." });
    }
    const userToFollow = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }
    const alreadyFollowing = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { following: { some: { id: userId } } },
    });
    if (alreadyFollowing.following.length > 0) {
      return res
        .status(400)
        .json({ message: "You are following this user already" });
    }
    await prisma.user.update({
      where: { id: currentUserId },
      data: { following: { connect: { id: userId } } },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { followers: { connect: { id: currentUserId } } },
    });
    res.status(200).json({ message: "Followed this user!" });
  } catch (error) {
    res.status(500).json({ message: "Couldnt follow that user :(" });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const notFollowing = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { following: { some: { id: userId } } },
    });
    if (notFollowing.following.length === 0) {
      return res
        .status(400)
        .json({ message: "You cant unfollow a user you're not following" });
    }
    await prisma.user.update({
      where: { id: currentUserId },
      data: {
        following: { disconnect: { id: userId } },
      },
    });
    await prisma.user.update({
      where: { id: userId },
      data: {
        followers: { disconnect: { id: currentUserId } },
      },
    });

    res.status(200).json({ message: "Unfollowed!" });
  } catch (error) {
    res.status(500).json({ message: "We couldnt unfollow the user for you" });
  }
};

const getFollowers = async (req, res) => {
  try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
          where: { id },
          include: { followers: true }
      });
      res.json(user.followers);
  } catch (error) {
      res.status(500).json({ error: "We couldnt get the followers." });
  }
};

const getFollowing = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: currentUserId },
            select: {
                following: {
                    select: {
                        id: true,
                        name: true,
                        email: true } }}
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.following);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Could not get who you're following." });
    }
};

const getOtherUserProfile = async (req, res) => {
  try{
    const {id} = req.params;
    const user = await prisma.user.findUnique({
      where: {id},
      include: {
        reviews: {include: { game: true}},
        comments: true,
        followers: true,
        following: true,
      }
    });
    if (!user) {
      return res.status(500).json({ error: "User not found..."})
    }
  } catch (error) {
    res.status(500).json({ error: "we are having a difficult time getting that profile"})
  }
}

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserReviews,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getOtherUserProfile
};
