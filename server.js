const express = require("express");
const cors = require('cors');
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");
const PORT = 3808;

dotenv.config();

const app = express();

const corsOptions = {
  origin: [
    "https://capstone-frontend-wctm.onrender.com",  
    "http://localhost:5173",  
  ],
  methods: ["GET", "POST", "PUT", "DELETE"], 
  allowedHeaders: ["Content-Type", "Authorization"], 
};

app.use(cors(corsOptions));
app.use(express.json());
app.get("/", (req, res) => res.send("Welcome to the Video Game Review API"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`running on ${PORT}`);
});
