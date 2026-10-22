const mongoose = require("mongoose");


// ==========================================
// RESOURCE SCHEMA
// Admin-provided URL or file
// ==========================================

const resourceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["url", "file"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Used when type === "url"
    url: {
      type: String,
      default: "",
    },

    // Used when type === "file"
    fileName: {
      type: String,
      default: "",
    },

    fileUrl: {
      type: String,
      default: "",
    },

    publicId: {
      type: String,
      default: "",
    },

    resourceType: {
      type: String,
      default: "raw",
    },

    fileType: {
      type: String,
      default: "",
    },

    fileSize: {
      type: Number,
      default: 0,
    },

    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);


// ==========================================
// SUBMISSION SCHEMA
// Employee-uploaded work
// ==========================================

const submissionSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    resourceType: {
      type: String,
      default: "raw",
    },

    fileType: {
      type: String,
      default: "",
    },

    fileSize: {
      type: Number,
      default: 0,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);


// ==========================================
// TASK SCHEMA
// ==========================================

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "in-progress",
        "completed",
      ],
      default: "pending",
    },

    priority: {
      type: String,
      enum: [
        "low",
        "medium",
        "high",
      ],
      default: "medium",
    },

    deadline: {
      type: Date,
      required: true,
    },

    // ==========================================
    // EMPLOYEE SUBMISSIONS
    // ==========================================

    submissions: {
      type: [submissionSchema],
      default: [],
    },

    // ==========================================
    // ADMIN RESOURCES
    // ==========================================

    resources: {
      type: [resourceSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);


// ==========================================
// EXPORT
// ==========================================

module.exports = mongoose.model(
  "Task",
  taskSchema
);