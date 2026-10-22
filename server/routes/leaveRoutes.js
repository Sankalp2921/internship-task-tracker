
const express = require("express");
const mongoose = require("mongoose");

const LeaveRequest = require("../models/LeaveRequest");
const User = require("../models/User");
const Attendance = require("../models/Attendance");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

const isValidDate = (value) => {
  if (typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value;
};

// EMPLOYEE: Submit a leave request
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({
        message: "Only employees can submit leave requests.",
      });
    }

    const { leaveFrom, leaveTo, subject, reason } = req.body;

    if (
      !isValidDate(leaveFrom) ||
      !isValidDate(leaveTo) ||
      leaveFrom > leaveTo ||
      typeof subject !== "string" ||
      !subject.trim() ||
      typeof reason !== "string" ||
      !reason.trim()
    ) {
      return res.status(400).json({
        message: "Provide valid leave dates, subject, and reason.",
      });
    }

    const leaveRequest = await LeaveRequest.create({
      employee: req.user.id,
      leaveFrom,
      leaveTo,
      subject: subject.trim(),
      reason: reason.trim(),
    });

    return res.status(201).json({
      message: "Leave request submitted successfully.",
      leaveRequest,
    });
  } catch (error) {
    console.error("Submit leave request error:", error);

    return res.status(500).json({
      message: "Server error while submitting leave request.",
    });
  }
});

// EMPLOYEE: View own leave requests
router.get("/my-requests", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({
        message: "This route is for employees.",
      });
    }

    const leaveRequests = await LeaveRequest.find({
      employee: req.user.id,
    }).sort({ createdAt: -1 });

    return res.json({ leaveRequests });
  } catch (error) {
    console.error("Fetch own leave requests error:", error);

    return res.status(500).json({
      message: "Server error while fetching leave requests.",
    });
  }
});

// ADMIN: View all leave requests
router.get(
  "/admin",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const leaveRequests = await LeaveRequest.find()
        .populate("employee", "name email profilePhoto")
        .populate("reviewedBy", "name email")
        .sort({ createdAt: -1 });

      return res.json({ leaveRequests });
    } catch (error) {
      console.error("Admin fetch leave requests error:", error);

      return res.status(500).json({
        message: "Server error while fetching leave requests.",
      });
    }
  }
);

// ADMIN: Approve or reject a leave request
router.patch(
  "/admin/:id/review",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { status, adminComment = "" } = req.body;

      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid leave request ID.",
        });
      }

      if (!["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({
          message: "Status must be Approved or Rejected.",
        });
      }

      if (typeof adminComment !== "string") {
        return res.status(400).json({
          message: "Admin comment must be text.",
        });
      }

      const leaveRequest = await LeaveRequest.findById(req.params.id);

      if (!leaveRequest) {
        return res.status(404).json({
          message: "Leave request not found.",
        });
      }

      if (leaveRequest.status !== "Pending") {
        return res.status(409).json({
          message: "This request has already been reviewed.",
        });
      }

      if (status === "Approved") {
        // Prevent overlapping approved leave for the same employee.
        const overlappingLeave = await LeaveRequest.findOne({
          _id: { $ne: leaveRequest._id },
          employee: leaveRequest.employee,
          status: "Approved",
          leaveFrom: { $lte: leaveRequest.leaveTo },
          leaveTo: { $gte: leaveRequest.leaveFrom },
        });

        if (overlappingLeave) {
          return res.status(409).json({
            message: "This request overlaps an existing approved leave.",
          });
        }

        // Do not approve leave that conflicts with an existing check-in.
        const attendanceConflict = await Attendance.findOne({
          employee: leaveRequest.employee,
          date: {
            $gte: leaveRequest.leaveFrom,
            $lte: leaveRequest.leaveTo,
          },
          checkIn: { $ne: null },
        });

        if (attendanceConflict) {
          return res.status(409).json({
            message:
              "The employee has attendance recorded during these dates. Resolve the conflict before approval.",
          });
        }
      }

      leaveRequest.status = status;
      leaveRequest.adminComment = adminComment.trim();
      leaveRequest.reviewedBy = req.user.id;
      leaveRequest.reviewedAt = new Date();

      await leaveRequest.save();

      return res.json({
        message: `Leave request ${status.toLowerCase()} successfully.`,
        leaveRequest,
      });
    } catch (error) {
      console.error("Review leave request error:", error);

      return res.status(500).json({
        message: "Server error while reviewing leave request.",
      });
    }
  }
);

module.exports = router;
