const express = require("express");
const Task = require("../models/Task");
const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================
// CREATE & ASSIGN TASK
// ADMIN ONLY
// ======================================
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const {
        title,
        description,
        assignedTo,
        priority,
        deadline,
      } = req.body;

      // Check required fields
      if (
        !title ||
        !description ||
        !assignedTo ||
        !deadline
      ) {
        return res.status(400).json({
          message:
            "Title, description, assignedTo and deadline are required",
        });
      }

      // Check employee exists
      const employee = await User.findOne({
        _id: assignedTo,
        role: "employee",
      });

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      // Create task
      const task = await Task.create({
        title,
        description,
        assignedTo,
        assignedBy: req.user.id,
        priority: priority || "medium",
        deadline,
      });

      res.status(201).json({
        message: "Task created and assigned successfully",
        task,
      });
    } catch (error) {
      console.error("Create task error:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);
// ======================================
// GET MY TASKS
// EMPLOYEE ONLY
// ======================================
router.get(
  "/my-tasks",
  authMiddleware,
  roleMiddleware(["employee"]),
  async (req, res) => {
    try {
      const tasks = await Task.find({
        assignedTo: req.user.id,
      })
        .populate("assignedBy", "name email")
        .sort({ createdAt: -1 });

      res.status(200).json({
        message: "Your tasks fetched successfully",
        count: tasks.length,
        tasks,
      });
    } catch (error) {
      console.error("Fetch my tasks error:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);
// ======================================
// UPDATE TASK STATUS
// EMPLOYEE ONLY
// ======================================
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["employee"]),
  async (req, res) => {
    try {
      const { status } = req.body;

      // Check status
      const allowedStatuses = [
        "pending",
        "in-progress",
        "completed",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message:
            "Invalid status. Use pending, in-progress, or completed",
        });
      }

      // Find task belonging to logged-in employee
      const task = await Task.findOne({
        _id: req.params.id,
        assignedTo: req.user.id,
      });

      if (!task) {
        return res.status(404).json({
          message: "Task not found",
        });
      }

      // Update status
      task.status = status;

      await task.save();

      res.status(200).json({
        message: "Task status updated successfully",
        task,
      });
    } catch (error) {
      console.error("Update task status error:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);
// ======================================
// UPDATE TASK
// ADMIN ONLY
// ======================================
router.patch(
  "/admin/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const {
        title,
        description,
        assignedTo,
        priority,
        deadline,
      } = req.body;

      // Find task
      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({
          message: "Task not found",
        });
      }

      // If assignedTo is changed, verify employee
      if (assignedTo) {
        const employee = await User.findOne({
          _id: assignedTo,
          role: "employee",
        });

        if (!employee) {
          return res.status(404).json({
            message: "Employee not found",
          });
        }

        task.assignedTo = assignedTo;
      }

      // Update fields only if provided
      if (title !== undefined) {
        task.title = title;
      }

      if (description !== undefined) {
        task.description = description;
      }

      if (priority !== undefined) {
        task.priority = priority;
      }

      if (deadline !== undefined) {
        task.deadline = deadline;
      }

      await task.save();

      // Return updated task with employee details
      await task.populate("assignedTo", "name email role");
      await task.populate("assignedBy", "name email role");

      res.status(200).json({
        message: "Task updated successfully",
        task,
      });

    } catch (error) {

      console.error("Update task error:", error);

      res.status(500).json({
        message: "Server error",
      });

    }
  }
);
// ======================================
// DELETE TASK
// ADMIN ONLY
// ======================================
router.delete(
  "/admin/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {

      const task = await Task.findById(
        req.params.id
      );

      if (!task) {
        return res.status(404).json({
          message: "Task not found",
        });
      }

      await Task.findByIdAndDelete(
        req.params.id
      );

      res.status(200).json({
        message: "Task deleted successfully",
      });

    } catch (error) {

      console.error(
        "Delete task error:",
        error
      );

      res.status(500).json({
        message: "Server error",
      });

    }
  }
);
// ======================================
// GET ALL TASKS
// ADMIN ONLY
// ======================================
router.get(
  "/admin/all",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const tasks = await Task.find()
        .populate("assignedTo", "name email role")
        .populate("assignedBy", "name email role")
        .sort({ createdAt: -1 });

      res.status(200).json({
        message: "All tasks fetched successfully",
        count: tasks.length,
        tasks,
      });
    } catch (error) {
      console.error("Fetch all tasks error:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ======================================
// GET TASK STATISTICS
// ADMIN ONLY
// ======================================
router.get(
  "/admin/stats",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const totalTasks = await Task.countDocuments();

      const pending = await Task.countDocuments({
        status: "pending",
      });

      const inProgress = await Task.countDocuments({
        status: "in-progress",
      });

      const completed = await Task.countDocuments({
        status: "completed",
      });

      res.status(200).json({
        message: "Task statistics fetched successfully",
        stats: {
          totalTasks,
          pending,
          inProgress,
          completed,
        },
      });
    } catch (error) {
      console.error("Task statistics error:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);
module.exports = router;