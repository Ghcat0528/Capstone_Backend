const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getUserProfile = async (req, res) => {
  try {
    console.log("Request user object:", req.user); // Debugging log

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
        // Fetching followers and following through the UserFollow relation
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

    // ✅ Extract only the following and followers list properly
    const followingList = user.follows.map((f) => f.following);
    const followersList = user.followedBy.map((f) => f.follower);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      reviews: user.reviews,
      following: followingList, // Clean list of followed users
      followers: followersList, // Clean list of followers
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

    // Update the user's profile with the data provided in req.body
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: req.body, // Assuming req.body contains the fields to update
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
const deleteUserProfile = async (req, res) => {
  try {
    // Ensure the user is logged in and has a valid user ID
    const { userId } = req.user; // User from authentication middleware

    if (!userId) {
      return res.status(400).json({ error: "User ID not found in request" });
    }

    // Optionally: Check if the user is trying to delete their own profile
    // In this case, it would already be handled by using req.user.userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete user-related data (reviews, followers, etc.) before deleting user
    await prisma.review.deleteMany({
      where: { userId: userId }, // Delete all reviews made by the user
    });

    await prisma.follower.deleteMany({
      where: { followerId: userId }, // Delete all follower records for this user
    });

    await prisma.following.deleteMany({
      where: { followingId: userId }, // Delete all following records for this user
    });

    // Finally, delete the user profile
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
  const loggedInUserId = req.user.userId; // Use logged-in user ID from req.user
  const { userId } = req.params; // The user to follow

  try {
    const followerId = String(loggedInUserId);
    const followingId = String(userId);

    const followerExists = await prisma.user.findUnique({ where: { id: followerId } });
    const followingExists = await prisma.user.findUnique({ where: { id: followingId } });

    if (!followerExists) {
      return res.status(400).json({ message: "Follower user does not exist." });
    }

    if (!followingExists) {
      return res.status(400).json({ message: "User to follow does not exist." });
    }

    // Check if already following
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: loggedInUserId,
          followingId: userId,
        }
      }
    });
    
    if (existingFollow) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Create the follow relationship by adding to both `follows` and `followedBy`
    await prisma.user.update({
      where: { id: followerId },
      data: {
        follows: {
          connect: { id: followingId },
        },
      },
    });

    await prisma.user.update({
      where: { id: followingId },
      data: {
        followedBy: {
          connect: { id: followerId },
        },
      },
    });

    res.status(200).json({ message: "Followed successfully!" });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ message: "We couldn't follow the user for you." });
  }
};

const unfollowUser = async (req, res) => {
  const loggedInUserId = req.user.userId; // Get the logged-in user's ID
  const { userId } = req.params; // Get the userId to unfollow

  if (loggedInUserId === userId) {
    return res.status(400).json({ message: "You can't unfollow yourself." });
  }

  try {
    const followerId = String(loggedInUserId);
    const followingId = String(userId);

    // Check if the follow relationship exists
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!existingFollow) {
      return res.status(400).json({ message: "You can't unfollow a user you're not following." });
    }

    // Remove from both `follows` and `followedBy`
    await prisma.user.update({
      where: { id: followerId },
      data: {
        follows: {
          disconnect: { id: followingId },
        },
      },
    });

    await prisma.user.update({
      where: { id: followingId },
      data: {
        followedBy: {
          disconnect: { id: followerId },
        },
      },
    });

    res.status(200).json({ message: "Unfollowed successfully!" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ message: "We couldn't unfollow the user for you." });
  }
};


const getFollowers = async (req, res) => {
  try {
    // Ensure you're getting the userId correctly from the request parameters
    const userId = req.params.userId;  // This should be 'userId' if it's in the URL

    console.log(`Fetching followers for user with ID: ${userId}`);  // Check the value of userId

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,  // Use userId here
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
        follows: { // This includes the users the logged-in user is following
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
  try {
    const { userId } = req.params; // The userId we are checking if following
    const loggedInUser = req.user; // user is attached by authenticateUser middleware

    console.log("Checking follow status for userId:", userId);
    console.log("Logged-in user ID:", loggedInUser?.userId);

    if (!loggedInUser) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const followStatus = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: loggedInUser.userId,  // Correctly using loggedInUser.userId
          followingId: userId,              // Correctly using the userId parameter
        },
      },
    });

    res.json({ isFollowing: Boolean(followStatus) });
  } catch (error) {
    console.error("Error checking follow status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOtherUserProfile = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from the URL
    console.log("Fetching user with ID:", userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },  // Find user by the ID passed in the URL
      include: {
        reviews: { include: { game: true } },
        // Fetch followers and following through the UserFollow relation
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

    // Extract following and followers as well
    const followingList = user.follows.map((f) => f.following);
    const followersList = user.followedBy.map((f) => f.follower);

    res.json({
      ...user,
      following: followingList,  // Clean following list
      followers: followersList,  // Clean followers list
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
