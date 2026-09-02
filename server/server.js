const roleMiddleware = require("./middleware/roleMiddleware");
const express = require("express");
const cors = require("cors");

const mongoose = require("mongoose");
require("dotenv").config();
const authMiddleware = require("./middleware/authMiddleware");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const app = express();

const PORT = process.env.PORT || 5001;


// middleware


app.use(cors());
app.use(express.json());


// routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tasks", taskRoutes);
// test route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed a protected route successfully 🔐",
    user: req.user,
  });
});

// Admin-only test route
app.get(
  "/api/admin-test",
  authMiddleware,
  roleMiddleware(["admin"]),
  (req, res) => {
    res.json({
      message: "Welcome Admin! 👑",
      user: req.user,
    });
  }
);
// =========================
// MONGODB CONNECTION
// =========================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully ");
  })
  .catch((error) => {
    console.error("MongoDB connection failed ❌");
    console.error(error.message);
  });

// =========================
// TEST ROUTE
// =========================

app.get("/", (req, res) => {
  res.send("Internship Task Tracker API is running 🚀");
});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});