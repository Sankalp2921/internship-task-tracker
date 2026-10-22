const express = require("express");
const User = require("../models/User");
const Attendance = require("../models/Attendance");

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

/* ======================================
   ADMIN ATTENDANCE — DATE HELPER
====================================== */

const getIndiaToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const getAttendanceMinutes = (record) => {
  if (record.checkIn && !record.checkOut) {
    return Math.max(
      0,
      Math.floor(
        (Date.now() - new Date(record.checkIn).getTime()) / 60000
      )
    );
  }

  return record.totalMinutes || 0;
};

/* ======================================
   GET ALL EMPLOYEE ATTENDANCE
   GET /api/admin/attendance?date=YYYY-MM-DD
====================================== */

router.get(
  "/attendance",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const date = req.query.date || getIndiaToday();
      const search = String(req.query.search || "").trim();

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          message: "Invalid date. Use YYYY-MM-DD.",
        });
      }

      const employeeFilter = { role: "employee" };

      if (search) {
        employeeFilter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const employees = await User.find(employeeFilter)
        .select("name email profilePhoto")
        .lean();

      const employeeIds = employees.map((employee) => employee._id);

      const records = await Attendance.find({
        date,
        employee: { $in: employeeIds },
      })
        .populate("employee", "name email profilePhoto")
        .sort({ checkIn: -1 })
        .lean();

      const recordByEmployee = new Map(
        records.map((record) => [
          String(record.employee?._id),
          record,
        ])
      );

      const attendance = employees.map((employee) => {
        const record = recordByEmployee.get(String(employee._id));

        
        return {
          employee: {
            _id: employee._id,
            name: employee.name,
            email: employee.email,
            profilePhoto: employee.profilePhoto || null,
          },
          date,
          checkIn: record?.checkIn || null,
          checkOut: record?.checkOut || null,
          workingMinutes: record ? getAttendanceMinutes(record) : 0,
          status: record?.status || "Unmarked",
          checkInPhoto: record?.checkInPhoto?.url || null,
          checkOutPhoto: record?.checkOutPhoto?.url || null,

          // GPS distance information for admin only
          checkInLocation: record?.checkInLocation || null,
          checkOutLocation: record?.checkOutLocation || null,
          checkInDistanceMeters:
            record?.checkInLocation?.distanceMeters ?? null,
          checkOutDistanceMeters:
            record?.checkOutLocation?.distanceMeters ?? null,
        };

      });

      return res.status(200).json({
        message: "Attendance fetched successfully.",
        date,
        count: attendance.length,
        attendance,
      });
    } catch (error) {
      console.error("Admin attendance error:", error);

      return res.status(500).json({
        message: "Server error while fetching attendance.",
      });
    }
  }
);

/* ======================================
   ADMIN ATTENDANCE SUMMARY
   GET /api/admin/attendance/summary
====================================== */

router.get(
  "/attendance/summary",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const today = getIndiaToday();

      const totalEmployees = await User.countDocuments({
        role: "employee",
      });

      const records = await Attendance.find({
        date: today,
      }).lean();

      const present = records.filter(
        (record) =>
          record.checkIn && record.status === "Present"
      ).length;

      const late = records.filter(
        (record) =>
          record.checkIn && record.status === "Late"
      ).length;

      const leave = records.filter(
        (record) => record.status === "Leave"
      ).length;

      return res.status(200).json({
        date: today,
        totalEmployees,
        present,
        late,
        leave,
        markedAttendance: records.length,
        message:
          "Absent and approved-leave counts will be finalized when the leave workflow is connected.",
      });
    } catch (error) {
      console.error("Admin attendance summary error:", error);

      return res.status(500).json({
        message: "Server error while fetching attendance summary.",
      });
    }
  }
);

module.exports = router;