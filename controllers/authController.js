const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
require('dotenv').config();

const createToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role }, 
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const registerUser = async (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 8);
  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
    res.status(201).json({ message: "You just got registered", user });
  } catch (error) {
    res.status(500).json({ error: "Didn't register you..." });
  }
};

const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Log incoming request to ensure data is passed correctly
      console.log("Login request body:", req.body);
  
      const user = await prisma.user.findUnique({
        where: { email },
      });
  
      if (!user) {
        console.log("User not found for email:", email);
        return res.status(404).json({ message: 'User not found. Please register first.' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log("Invalid password for user:", email);
        return res.status(401).json({ message: 'Incorrect username or password.' });
      }
     
      const token = createToken(user);
      return res.status(200).json({ message: "Logged in!", token });
    } catch (error) {
      console.error("Error during login:", error);  // Log full error for debugging
      return res.status(500).json({ message: 'An error occurred during login.' });
    }
  };
  
module.exports = { registerUser, loginUser };
