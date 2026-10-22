
const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const authMiddleware = require("../middleware/authMiddleware");
const attendancePhotoUpload = require("../middleware/attendancePhotoUpload");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const cloudinary = require("../config/cloudinary");

// =====================================================
// DATE HELPERS — INDIA TIMEZONE
// =====================================================
const getTodayDate = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const getDateOffset = (dateString, offset) => {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

const getPeriodDates = (today) => {
  const date = new Date(`${today}T00:00:00.000Z`);
  const day = date.getUTCDay();
  // Monday is the first day of the week.
  const daysSinceMonday = (day + 6) % 7;

  return {
    today,
    weekStart: getDateOffset(today, -daysSinceMonday),
    monthStart: `${today.slice(0, 7)}-01`,
    yearStart: `${today.slice(0, 4)}-01-01`,
  };
};

// =====================================================
// OFFICE TIMING — INDIA TIME
// =====================================================
const OFFICE_START_MINUTES = 9 * 60 + 30;
const GRACE_PERIOD_MINUTES = 15;

const isLateArrival = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const hour = Number(
    parts.find((part) => part.type === "hour").value
  );

  const minute = Number(
    parts.find((part) => part.type === "minute").value
  );

  const arrivalMinutes = hour * 60 + minute;

  return arrivalMinutes >
    OFFICE_START_MINUTES + GRACE_PERIOD_MINUTES;
};

// =====================================================
// WORKING MINUTES
// =====================================================
const getWorkingMinutes = (attendance, now = new Date()) => {
  if (attendance.checkIn && !attendance.checkOut) {
    return Math.max(
      0,
      Math.floor(
        (now.getTime() - new Date(attendance.checkIn).getTime()) /
          60000
      )
    );
  }

  return attendance.totalMinutes || 0;
};

const sumMinutes = (records, startDate, endDate, now) =>
  records
    .filter(
      (record) => record.date >= startDate && record.date <= endDate
    )
    .reduce(
      (total, record) => total + getWorkingMinutes(record, now),
      0
    );

// =====================================================
// CLOUDINARY CLEANUP
// =====================================================
const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary cleanup error:", error.message);
  }
};


/* =====================================================
   GPS / DISTANCE CALCULATION
   GPS is optional. Never reject attendance based on distance.
===================================================== */

const getValidatedOfficeLocation = (req) => {
  const rawLatitude = req.body?.latitude;
  const rawLongitude = req.body?.longitude;
  const rawAccuracy = req.body?.accuracy;

  // Allow attendance when the browser cannot provide GPS.
  if (
    rawLatitude === undefined ||
    rawLatitude === "" ||
    rawLongitude === undefined ||
    rawLongitude === ""
  ) {
    return null;
  }

  const latitude = Number(rawLatitude);
  const longitude = Number(rawLongitude);
  const accuracy =
    rawAccuracy === undefined || rawAccuracy === ""
      ? null
      : Number(rawAccuracy);

  // Do not store invalid coordinates.
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180 ||
    (accuracy !== null &&
      (!Number.isFinite(accuracy) || accuracy < 0))
  ) {
    return null;
  }

  const officeLatitude = Number(process.env.OFFICE_LATITUDE);
  const officeLongitude = Number(process.env.OFFICE_LONGITUDE);

  // GPS can still be recorded if office coordinates aren't configured,
  // but distance cannot be calculated.
  let distanceMeters = null;

  if (
    Number.isFinite(officeLatitude) &&
    Number.isFinite(officeLongitude) &&
    officeLatitude >= -90 &&
    officeLatitude <= 90 &&
    officeLongitude >= -180 &&
    officeLongitude <= 180
  ) {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const earthRadiusMeters = 6371000;

    const deltaLatitude = toRadians(latitude - officeLatitude);
    const deltaLongitude = toRadians(longitude - officeLongitude);

    const a =
      Math.sin(deltaLatitude / 2) ** 2 +
      Math.cos(toRadians(officeLatitude)) *
        Math.cos(toRadians(latitude)) *
        Math.sin(deltaLongitude / 2) ** 2;

    const distance =
      earthRadiusMeters *
      2 *
      Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    distanceMeters = Math.round(distance);
  }

  return {
    latitude,
    longitude,
    accuracy,
    distanceMeters,
  };
};


// =====================================================
// CHECK-IN
// POST /api/attendance/check-in
// =====================================================
router.post(
  "/check-in",
  authMiddleware,
  attendancePhotoUpload.single("photo"),
  async (req, res) => {
    let uploadedPhoto = null;

    try {
      const employeeId = req.user.id;

      if (!req.file) {
        return res.status(400).json({
          message: "Please capture a selfie before checking in.",
        });
      }

      // Validate GPS before uploading the selfie.
      const location = getValidatedOfficeLocation(req);

      const today = getTodayDate();

      let attendance = await Attendance.findOne({
        employee: employeeId,
        date: today,
      });

      if (attendance?.checkIn) {
        return res.status(400).json({
          message: "You have already checked in today.",
          attendance,
        });
      }

      uploadedPhoto = await uploadToCloudinary(req.file);

      if (
        !uploadedPhoto?.secure_url ||
        !uploadedPhoto?.public_id
      ) {
        throw new Error(
          "Cloudinary did not return valid photo details."
        );
      }

      if (!attendance) {
        attendance = new Attendance({
          employee: employeeId,
          date: today,
          status: "Present",
        });
      }

      const checkInTime = new Date();

      attendance.checkIn = checkInTime;
      attendance.status = isLateArrival(checkInTime)
        ? "Late"
        : "Present";

      attendance.checkInLocation = location
  ? {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      distanceMeters: location.distanceMeters,
      capturedAt: checkInTime,
    }
  : {
      latitude: null,
      longitude: null,
      accuracy: null,
      distanceMeters: null,
      capturedAt: null,
    };

      attendance.checkInPhoto = {
        url: uploadedPhoto.secure_url,
        publicId: uploadedPhoto.public_id,
      };

      await attendance.save();

      return res.status(200).json({
        message: "Check-in successful.",
        attendance,
      });
    } catch (error) {
      console.error("Check-in error:", error.message);

      if (uploadedPhoto?.public_id) {
        await deleteCloudinaryImage(uploadedPhoto.public_id);
      }

      if (error.code === 11000) {
        return res.status(409).json({
          message:
            "Attendance already exists for today. Refresh and try again.",
        });
      }

      return res.status(500).json({
        message: "Server error while checking in.",
      });
    }
  }
);

// =====================================================
// CHECK-OUT
// POST /api/attendance/check-out
// =====================================================
router.post(
  "/check-out",
  authMiddleware,
  attendancePhotoUpload.single("photo"),
  async (req, res) => {
    let uploadedPhoto = null;

    try {
      const employeeId = req.user.id;

      if (!req.file) {
        return res.status(400).json({
          message: "Please capture a selfie before checking out.",
        });
      }

      // Validate GPS before uploading the selfie.
     const location = getValidatedOfficeLocation(req);

      const today = getTodayDate();

      const attendance = await Attendance.findOne({
        employee: employeeId,
        date: today,
      });

      if (!attendance || !attendance.checkIn) {
        return res.status(400).json({
          message: "You must check in before checking out.",
        });
      }

      if (attendance.checkOut) {
        return res.status(400).json({
          message: "You have already checked out today.",
          attendance,
        });
      }

      uploadedPhoto = await uploadToCloudinary(req.file);

      if (
        !uploadedPhoto?.secure_url ||
        !uploadedPhoto?.public_id
      ) {
        throw new Error(
          "Cloudinary did not return valid photo details."
        );
      }

      const checkoutTime = new Date();

      attendance.checkOut = checkoutTime;

      attendance.checkOutLocation = location
  ? {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      distanceMeters: location.distanceMeters,
      capturedAt: checkoutTime,
    }
  : {
      latitude: null,
      longitude: null,
      accuracy: null,
      distanceMeters: null,
      capturedAt: null,
    };

      attendance.checkOutPhoto = {
        url: uploadedPhoto.secure_url,
        publicId: uploadedPhoto.public_id,
      };

      const difference =
        checkoutTime.getTime() -
        new Date(attendance.checkIn).getTime();

      attendance.totalMinutes = Math.max(
        0,
        Math.floor(difference / 60000)
      );

      await attendance.save();

      return res.status(200).json({
        message: "Check-out successful.",
        attendance,
      });
    } catch (error) {
      console.error("Check-out error:", error.message);

      if (uploadedPhoto?.public_id) {
        await deleteCloudinaryImage(uploadedPhoto.public_id);
      }

      if (error.code === 11000) {
        return res.status(409).json({
          message:
            "Attendance already exists for today. Refresh and try again.",
        });
      }

      return res.status(500).json({
        message: "Server error while checking out.",
      });
    }
  }
);

// =====================================================
// TODAY'S ATTENDANCE
// GET /api/attendance/today
// =====================================================
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      employee: req.user.id,
      date: getTodayDate(),
    });

    return res.status(200).json({
      attendance: attendance || null,
    });
  } catch (error) {
    console.error("Get attendance error:", error.message);

    return res.status(500).json({
      message: "Server error while getting attendance.",
    });
  }
});

// =====================================================
// WORKING HOURS SUMMARY
// GET /api/attendance/summary
// =====================================================
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const now = new Date();

    const { today, weekStart, monthStart, yearStart } =
      getPeriodDates(getTodayDate());

    const records = await Attendance.find({
      employee: req.user.id,
      date: { $gte: yearStart, $lte: today },
    }).lean();

    const todayMinutes = sumMinutes(records, today, today, now);
    const weekMinutes = sumMinutes(records, weekStart, today, now);
    const monthMinutes = sumMinutes(records, monthStart, today, now);
    const yearMinutes = sumMinutes(records, yearStart, today, now);

    return res.status(200).json({
      summary: {
        todayMinutes,
        weekMinutes,
        monthMinutes,
        yearMinutes,
        dailyTargetMinutes: 480,
      },
    });
  } catch (error) {
    console.error("Attendance summary error:", error.message);

    return res.status(500).json({
      message: "Server error while getting attendance summary.",
    });
  }
});

// =====================================================
// ATTENDANCE HISTORY
// GET /api/attendance/history
// =====================================================
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);

    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 30;

    const history = await Attendance.find({
      employee: req.user.id,
    })
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({ history });
  } catch (error) {
    console.error("Attendance history error:", error.message);

    return res.status(500).json({
      message: "Server error while getting attendance history.",
    });
  }
});

module.exports = router;
