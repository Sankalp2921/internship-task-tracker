const express = require("express");

const Task = require("../models/Task");
const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploadMiddleware");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const cloudinary = require("../config/cloudinary");

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

      // -------------------------------
      // VALIDATION
      // -------------------------------

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

      // -------------------------------
      // CHECK EMPLOYEE
      // -------------------------------

      const employee = await User.findOne({
        _id: assignedTo,
        role: "employee",
      });

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      // -------------------------------
      // CREATE TASK
      // -------------------------------

      const task = await Task.create({
        title,
        description,
        assignedTo,
        assignedBy: req.user.id,
        priority: priority || "medium",
        deadline,
      });

      res.status(201).json({
        message:
          "Task created and assigned successfully",
        task,
      });
    } catch (error) {
      console.error(
        "Create task error:",
        error
      );

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
        .populate(
          "assignedBy",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

      res.status(200).json({
        message:
          "Your tasks fetched successfully",

        count: tasks.length,

        tasks,
      });
    } catch (error) {
      console.error(
        "Fetch my tasks error:",
        error
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// ======================================
// UPLOAD TASK SUBMISSIONS
// EMPLOYEE ONLY
// ======================================

router.post(
  "/:id/submissions",
  authMiddleware,
  roleMiddleware(["employee"]),
  upload.array("files", 5),

  async (req, res) => {
    try {
      // -------------------------------
      // CHECK FILES
      // -------------------------------

      if (
        !req.files ||
        req.files.length === 0
      ) {
        return res.status(400).json({
          message:
            "Please select at least one file",
        });
      }

      // -------------------------------
      // FIND TASK
      // -------------------------------

      const task = await Task.findOne({
        _id: req.params.id,
        assignedTo: req.user.id,
      });

      if (!task) {
        return res.status(404).json({
          message: "Task not found",
        });
      }

      // -------------------------------
      // UPLOAD FILES TO CLOUDINARY
      // -------------------------------

      const uploadedFiles =
        await Promise.all(
          req.files.map(
            async (file) => {
              const result =
                await uploadToCloudinary(
                  file
                );

              return {
                fileName:
                  file.originalname,

                fileUrl:
                  result.secure_url,

                publicId:
                  result.public_id,

                resourceType:
                  result.resource_type ||
                  "raw",

                fileType:
                  file.mimetype,

                fileSize:
                  file.size,

                uploadedAt:
                  new Date(),
              };
            }
          )
        );

      // -------------------------------
      // SAVE FILES TO TASK
      // -------------------------------

      task.submissions.push(
        ...uploadedFiles
      );

      // -------------------------------
      // AUTOMATICALLY COMPLETE TASK
      // -------------------------------

      task.status = "completed";

      await task.save();

      // -------------------------------
      // RESPONSE
      // -------------------------------

      res.status(201).json({
        message:
          "Files uploaded successfully. Task marked as completed.",

        submissions:
          uploadedFiles,

        task,
      });
    } catch (error) {
      console.error(
        "Upload submission error:",
        error
      );

      res.status(500).json({
        message:
          "File upload failed",

        error:
          error.message,
      });
    }
  }
);


// ======================================
// DELETE TASK SUBMISSION
// EMPLOYEE ONLY
// ======================================

router.delete(
  "/:taskId/submissions/:submissionId",
  authMiddleware,
  roleMiddleware(["employee"]),

  async (req, res) => {
    try {
      const {
        taskId,
        submissionId,
      } = req.params;

      // -------------------------------
      // FIND TASK
      // -------------------------------

      const task =
        await Task.findOne({
          _id: taskId,
          assignedTo: req.user.id,
        });

      if (!task) {
        return res.status(404).json({
          message:
            "Task not found",
        });
      }

      // -------------------------------
      // FIND SUBMISSION
      // -------------------------------

      const submission =
        task.submissions.id(
          submissionId
        );

      if (!submission) {
        return res.status(404).json({
          message:
            "Submission not found",
        });
      }

      // -------------------------------
      // DELETE FROM CLOUDINARY
      // -------------------------------

      if (submission.publicId) {
        await cloudinary.uploader.destroy(
          submission.publicId,
          {
            resource_type:
              submission.resourceType ||
              "raw",

            type: "upload",

            invalidate: true,
          }
        );
      }

      // -------------------------------
      // REMOVE FROM MONGODB
      // -------------------------------

      task.submissions.pull(
        submissionId
      );

      // -------------------------------
      // UPDATE TASK STATUS
      // -------------------------------

      if (
        task.submissions.length === 0
      ) {
        task.status = "pending";
      } else {
        task.status = "completed";
      }

      await task.save();

      // -------------------------------
      // RESPONSE
      // -------------------------------

      res.status(200).json({
        message:
          "File deleted successfully",

        task,
      });
    } catch (error) {
      console.error(
        "Delete submission error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to delete submission.",

        error:
          error.message,
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
      const {
        status,
      } = req.body;

      // -------------------------------
      // ALLOWED STATUSES
      // -------------------------------

      const allowedStatuses = [
        "pending",
        "in-progress",
        "completed",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid status. Use pending, in-progress, or completed",
        });
      }

      // -------------------------------
      // FIND TASK
      // -------------------------------

      const task =
        await Task.findOne({
          _id: req.params.id,
          assignedTo: req.user.id,
        });

      if (!task) {
        return res.status(404).json({
          message:
            "Task not found",
        });
      }

      // -------------------------------
      // UPDATE STATUS
      // -------------------------------

      task.status = status;

      await task.save();

      res.status(200).json({
        message:
          "Task status updated successfully",

        task,
      });
    } catch (error) {
      console.error(
        "Update task status error:",
        error
      );

      res.status(500).json({
        message:
          "Server error",
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

      // -------------------------------
      // FIND TASK
      // -------------------------------

      const task =
        await Task.findById(
          req.params.id
        );

      if (!task) {
        return res.status(404).json({
          message:
            "Task not found",
        });
      }

      // -------------------------------
      // UPDATE EMPLOYEE
      // -------------------------------

      if (assignedTo) {
        const employee =
          await User.findOne({
            _id: assignedTo,
            role: "employee",
          });

        if (!employee) {
          return res.status(404).json({
            message:
              "Employee not found",
          });
        }

        task.assignedTo =
          assignedTo;
      }

      // -------------------------------
      // UPDATE TITLE
      // -------------------------------

      if (
        title !== undefined
      ) {
        task.title = title;
      }

      // -------------------------------
      // UPDATE DESCRIPTION
      // -------------------------------

      if (
        description !== undefined
      ) {
        task.description =
          description;
      }

      // -------------------------------
      // UPDATE PRIORITY
      // -------------------------------

      if (
        priority !== undefined
      ) {
        task.priority =
          priority;
      }

      // -------------------------------
      // UPDATE DEADLINE
      // -------------------------------

      if (
        deadline !== undefined
      ) {
        task.deadline =
          deadline;
      }

      await task.save();

      await task.populate(
        "assignedTo",
        "name email role"
      );

      await task.populate(
        "assignedBy",
        "name email role"
      );

      res.status(200).json({
        message:
          "Task updated successfully",

        task,
      });
    } catch (error) {
      console.error(
        "Update task error:",
        error
      );

      res.status(500).json({
        message:
          "Server error",
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
      const task =
        await Task.findById(
          req.params.id
        );

      if (!task) {
        return res.status(404).json({
          message:
            "Task not found",
        });
      }

      await Task.findByIdAndDelete(
        req.params.id
      );

      res.status(200).json({
        message:
          "Task deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete task error:",
        error
      );

      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);


// ======================================
// ADD URL RESOURCE TO TASK
// ADMIN ONLY
// ======================================

router.post(
  "/admin/:id/resources/url",
  authMiddleware,
  roleMiddleware(["admin"]),

  async (req, res) => {
    try {
      const { title, url } = req.body;

      // -------------------------------
      // VALIDATION
      // -------------------------------

      if (!title || !url) {
        return res.status(400).json({
          message:
            "Title and URL are required",
        });
      }

      // -------------------------------
      // FIND TASK
      // -------------------------------

      const task =
        await Task.findById(
          req.params.id
        );

      if (!task) {
        return res.status(404).json({
          message:
            "Task not found",
        });
      }

      // -------------------------------
      // VALIDATE URL
      // -------------------------------

      try {
        new URL(url);
      } catch (error) {
        return res.status(400).json({
          message:
            "Please enter a valid URL",
        });
      }

      // -------------------------------
      // ADD RESOURCE
      // -------------------------------

      task.resources.push({
        type: "url",
        title: title.trim(),
        url: url.trim(),
        addedAt: new Date(),
      });

      await task.save();

      // -------------------------------
      // RESPONSE
      // -------------------------------

      res.status(201).json({
        message:
          "URL resource added successfully",

        resource:
          task.resources[
            task.resources.length - 1
          ],

        task,
      });
    } catch (error) {
      console.error(
        "Add URL resource error:",
        error
      );

      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);


// ======================================
// UPLOAD FILE RESOURCE TO TASK
// ADMIN ONLY
// ======================================

router.post(
  "/admin/:id/resources/file",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.single("file"),

  async (req, res) => {
    try {
      // -------------------------------
      // CHECK FILE
      // -------------------------------

      if (!req.file) {
        return res.status(400).json({
          message:
            "Please select a file.",
        });
      }

      // -------------------------------
      // CHECK FILE TYPE
      // -------------------------------

      const allowedTypes = [
        "application/pdf",

        "application/msword",

        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        "application/vnd.ms-powerpoint",

        "application/vnd.openxmlformats-officedocument.presentationml.presentation",

        "application/vnd.ms-excel",

        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        "text/plain",
      ];

      if (
        !allowedTypes.includes(
          req.file.mimetype
        )
      ) {
        return res.status(400).json({
          message:
            "Only PDF, Word, PowerPoint, Excel and text documents are allowed.",
        });
      }

      // -------------------------------
      // CHECK RESOURCE TITLE
      // -------------------------------

      const { title } = req.body;

      if (
        !title ||
        !title.trim()
      ) {
        return res.status(400).json({
          message:
            "Resource title is required.",
        });
      }

      // -------------------------------
      // FIND TASK
      // -------------------------------

      const task =
        await Task.findById(
          req.params.id
        );

      if (!task) {
        return res.status(404).json({
          message:
            "Task not found.",
        });
      }

      // -------------------------------
      // UPLOAD TO CLOUDINARY
      // -------------------------------

      const result =
        await uploadToCloudinary(
          req.file
        );

      // -------------------------------
      // CREATE RESOURCE
      // -------------------------------

      const newResource = {
        type: "file",

        title:
          title.trim(),

        fileName:
          req.file.originalname,

        fileUrl:
          result.secure_url,

        publicId:
          result.public_id,

        resourceType:
          result.resource_type ||
          "raw",

        fileType:
          req.file.mimetype,

        fileSize:
          req.file.size,

        addedAt:
          new Date(),
      };

      // -------------------------------
      // SAVE RESOURCE
      // -------------------------------

      task.resources.push(
        newResource
      );

      await task.save();

      // -------------------------------
      // RESPONSE
      // -------------------------------

      res.status(201).json({
        message:
          "Document uploaded successfully.",

        resource:
          task.resources[
            task.resources.length - 1
          ],

        task,
      });
    } catch (error) {
      console.error(
        "Upload resource file error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to upload document.",

        error:
          error.message,
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
      const tasks =
        await Task.find()
          .populate(
            "assignedTo",
            "name email role"
          )
          .populate(
            "assignedBy",
            "name email role"
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        message:
          "All tasks fetched successfully",

        count:
          tasks.length,

        tasks,
      });
    } catch (error) {
      console.error(
        "Fetch all tasks error:",
        error
      );

      res.status(500).json({
        message:
          "Server error",
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
      const totalTasks =
        await Task.countDocuments();

      const pending =
        await Task.countDocuments({
          status: "pending",
        });

      const inProgress =
        await Task.countDocuments({
          status: "in-progress",
        });

      const completed =
        await Task.countDocuments({
          status: "completed",
        });

      res.status(200).json({
        message:
          "Task statistics fetched successfully",

        stats: {
          totalTasks,

          pending,

          inProgress,

          completed,
        },
      });
    } catch (error) {
      console.error(
        "Task statistics error:",
        error
      );

      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);


module.exports = router;