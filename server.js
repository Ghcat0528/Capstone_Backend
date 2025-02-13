const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const PORT = 3808

dotenv.config();
const app = express();

app.use(express.json());
app.get("/", (req, res) => res.send("Welcome to the Video Game Review API"));
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/reviews", reviewRoutes);

app.listen(PORT, () => {
    console.log(`running on ${PORT}`)
});