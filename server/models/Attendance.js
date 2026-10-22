
const mongoose = require("mongoose");

// GPS information captured separately for check-in and check-out.
const locationSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    accuracy: {
      type: Number,
      default: null,
    },
    distanceMeters: {
      type: Number,
      default: null,
    },
    capturedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    checkIn: {
      type: Date,
      default: null,
    },

    checkOut: {
      type: Date,
      default: null,
    },

    checkInPhoto: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
    },

    checkOutPhoto: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
    },

    // NEW: GPS data for both attendance actions
    checkInLocation: {
      type: locationSchema,
      default: () => ({}),
    },

    checkOutLocation: {
      type: locationSchema,
      default: () => ({}),
    },

    totalMinutes: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Present", "Late", "Absent", "Leave"],
      default: "Present",
    },
  },
  {
    timestamps: true,
  }
);

// One attendance record per employee per day
attendanceSchema.index(
  { employee: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
