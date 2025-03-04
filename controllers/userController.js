const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getUserProfile = async (req, res) => {
  try {

    if (!req.user || !req.user.userId) {
      return res.status(400).json({ error: "User ID not found in request" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        reviews: { include: { game: true } },
        followedBy: {
          select: {
            follower: {
              select: { id: true, name: true },
            },
          },
        },
        follows: {
          select: {
            following: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const followingList = user.follows.map((f) => f.following);
    const followersList = user.followedBy.map((f) => f.follower);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      reviews: user.reviews,
      following: followingList, 
      followers: followersList, 
    });
  } catch (error) {
    console.error("Error fetching user profile & following:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(400).json({ error: "User ID not found in request" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: req.body, 
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
const deleteUserProfile = async (req, res) => {
  try {
    const { userId } = req.user; 

    if (!userId) {
      return res.status(400).json({ error: "User ID not found in request" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await prisma.review.deleteMany({
      where: { userId: userId }, 
    });

    await prisma.follower.deleteMany({
      where: { followerId: userId }, 
    });

    await prisma.following.deleteMany({
      where: { followingId: userId }, 
    });

    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({ message: "User profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting user profile:", error);
    res.status(500).json({ error: "Failed to delete user profile" });
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
    res.status(500).json({ error: "We're having a hard time fetching reviews right now" });
  }
};

const followUser = async (req, res) => {
  const loggedInUserId = req.user.userId; 
  const { userId } = req.params;  

  try {
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: loggedInUserId,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      return res.status(400).json({ message: "Already following this user" });
    }

    await prisma.userFollow.create({
      data: {
        followerId: loggedInUserId,
        followingId: userId,
      },
    });

    res.status(200).json({ message: "Followed successfully." });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ message: "Error following user." });
  }
};

const unfollowUser = async (req, res) => {
  const loggedInUserId = req.user.userId;
  const { userId } = req.params;

  try {
    const follow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: loggedInUserId,
          followingId: userId,
        },
      },
    });

    if (!follow) {
      return res.status(400).json({ message: "You are not following this user" });
    }

    await prisma.userFollow.delete({
      where: {
        followerId_followingId: {
          followerId: loggedInUserId,
          followingId: userId,
        },
      },
    });

    res.status(200).json({ message: "Unfollowed successfully." });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ message: "Error unfollowing user." });
  }
};


const getFollowers = async (req, res) => {
  try {
    const userId = req.params.userId;  


    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,  
      },
      include: {
        followedBy: {
          include: {
            follower: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ followers: user.followedBy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch followers.", error: error.message });
  }
};


const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        follows: { 
          include: { following: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const following = user.follows.map(f => f.following);
    res.json({ following });
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ message: "Could not fetch following." });
  }
};


const isFollowing = async (req, res) => {
  const loggedInUserId = req.user.userId; 
  const { userId } = req.params;  

  try {
    const followStatus = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: loggedInUserId,
          followingId: userId,
        },
      },
    });

    res.status(200).json({ isFollowing: !!followStatus }); 
    console.error("Error checking follow status:", error);
    res.status(500).json({ message: "Failed to check follow status." });
  }
}


const getOtherUserProfile = async (req, res) => {
  try {
    const { userId } = req.params; 

    const user = await prisma.user.findUnique({
      where: { id: userId },  
      include: {
        reviews: { include: { game: true } },
        followedBy: {
          select: {
            follower: {
              select: { id: true, name: true },
            },
          },
        },
        follows: {
          select: {
            following: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found..." });
    }

    const followingList = user.follows.map((f) => f.following);
    const followersList = user.followedBy.map((f) => f.follower);

    res.json({
      ...user,
      following: followingList,  
      followers: followersList,  
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "We are having a difficult time getting that profile" });
  }
};

module.exports = {
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
};
