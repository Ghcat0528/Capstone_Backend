const express = require("express");
const cors = require('cors');
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");
const port = process.env.PORT || 3808;

dotenv.config();

const app = express();

app.use(cors({
  origins: [ 'https://beautiful-conkies-4d2965.netlify.app',  'https://67c7e74687e8055a087a9df6--beautiful-conkies-4d2965.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));



app.use(express.json());
app.get("/", (req, res) => res.send("Welcome to the Video Game Review API"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
