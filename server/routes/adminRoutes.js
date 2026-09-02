const express = require("express");
const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================
// GET ALL EMPLOYEES
// ======================================
router.get(
  "/users",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const users = await User.find(
        { role: "employee" },
        {
          password: 0,
          otp: 0,
          otpExpires: 0,
          __v: 0,
        }
      ).sort({ createdAt: -1 });

      res.status(200).json({
        message: "Employees fetched successfully",
        count: users.length,
        users,
      });
    } catch (error) {
      console.error("Fetch employees error:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);
// ======================================
// GET SINGLE EMPLOYEE
// ======================================
router.get(
  "/users/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const user = await User.findOne(
        {
          _id: req.params.id,
          role: "employee",
        },
        {
          password: 0,
          otp: 0,
          otpExpires: 0,
          __v: 0,
        }
      );

      if (!user) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      res.status(200).json({
        message: "Employee fetched successfully",
        user,
      });
    } catch (error) {
      console.error("Fetch employee error:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

module.exports = router;