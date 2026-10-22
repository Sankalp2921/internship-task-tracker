
const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    leaveFrom: {
      type: String,
      required: true,
    },

    leaveTo: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    adminComment: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
