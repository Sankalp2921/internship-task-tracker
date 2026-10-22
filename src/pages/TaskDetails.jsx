import React, { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTasks } from "../context/TaskContext";

function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
  tasks,
  loading,
  updateTaskStatus,
  uploadTaskFiles,
  deleteTaskFile,
} = useTasks();

  // ==========================================
  // FILE UPLOAD REF
  // ==========================================

  const fileInputRef = useRef(null);

  // ==========================================
  // STATUS STATES
  // ==========================================

  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // FILE UPLOAD STATES
  // ==========================================

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="page">
        <div className="details-card">
          <h1>Loading Task...</h1>

          <p>
            Please wait while we load the task details.
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // FIND TASK
  // ==========================================

  const task = tasks.find(
    (task) => task.id?.toString() === id
  );

  // ==========================================
  // TASK NOT FOUND
  // ==========================================

  if (!task) {
    return (
      <main className="page">
        <div className="details-card">
          <h1>Task Not Found</h1>

          <p>
            The task you are looking for does not exist
            or has been deleted.
          </p>

          <button
            className="primary-button"
            onClick={() => navigate("/tasks")}
          >
            ← Back to My Tasks
          </button>
        </div>
      </main>
    );
  }

  // ==========================================
  // STATUS DISPLAY
  // ==========================================

  const statusText = {
    pending: "Pending",
    "in-progress": "In Progress",
    completed: "Completed",
  };

  // ==========================================
  // PROGRESS
  // ==========================================

  const progress =
    task.status === "completed"
      ? 100
      : task.status === "in-progress"
        ? 50
        : 0;

  // ==========================================
  // DEADLINE STATUS
  // ==========================================

  const getDeadlineStatus = () => {
    if (task.status === "completed") {
      return {
        text: "Completed",
        className: "deadline-completed",
      };
    }

    if (!task.deadline) {
      return {
        text: "No deadline",
        className: "deadline-none",
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);

    const difference =
      deadline.getTime() - today.getTime();

    const daysLeft = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) {
      return {
        text: `Overdue by ${Math.abs(daysLeft)} day${
          Math.abs(daysLeft) === 1 ? "" : "s"
        }`,
        className: "deadline-overdue",
      };
    }

    if (daysLeft === 0) {
      return {
        text: "Due today",
        className: "deadline-today",
      };
    }

    if (daysLeft <= 3) {
      return {
        text: `Due in ${daysLeft} day${
          daysLeft === 1 ? "" : "s"
        }`,
        className: "deadline-soon",
      };
    }

    return {
      text: `${daysLeft} days remaining`,
      className: "deadline-normal",
    };
  };

  const deadlineStatus = getDeadlineStatus();

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const handleStatusUpdate = async (newStatus) => {
    setError("");
    setUpdating(true);

    const result = await updateTaskStatus(
      task.id,
      newStatus
    );

    setUpdating(false);

    if (!result.success) {
      setError(
        result.message ||
          "Unable to update task status."
      );
    }
  };

  // ==========================================
  // FILE SELECTION
  // ==========================================

  const handleFileChange = (event) => {
    const files = Array.from(
      event.target.files || []
    );

    setUploadMessage("");
    setUploadError("");

    // Maximum 5 files
    if (files.length > 5) {
      setUploadError(
        "You can upload a maximum of 5 files at once."
      );

      setSelectedFiles([]);
      event.target.value = "";
      return;
    }

    // Maximum 25 MB per file
    const oversizedFile = files.find(
      (file) => file.size > 25 * 1024 * 1024
    );

    if (oversizedFile) {
      setUploadError(
        `"${oversizedFile.name}" is larger than 25 MB.`
      );

      setSelectedFiles([]);
      event.target.value = "";
      return;
    }

    setSelectedFiles(files);
  };

  // ==========================================
  // FILE UPLOAD
  // ==========================================

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadError(
        "Please select at least one file."
      );
      return;
    }

    setUploading(true);
    setUploadMessage("");
    setUploadError("");

    const result = await uploadTaskFiles(
      task.id,
      selectedFiles
    );

    setUploading(false);

    if (!result.success) {
      setUploadError(
        result.message || "File upload failed."
      );
      return;
    }

    setUploadMessage(
      result.message ||
        "Files uploaded successfully."
    );

    setSelectedFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };



  // ==========================================
// DELETE UPLOADED FILE
// ==========================================

const handleDeleteFile = async (submissionId) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this file?"
  );

  if (!confirmed) {
    return;
  }

  setUploadMessage("");
  setUploadError("");

  const result = await deleteTaskFile(
    task.id,
    submissionId
  );

  if (!result.success) {
    setUploadError(
      result.message ||
        "Unable to delete file."
    );

    return;
  }

  setUploadMessage(
    result.message ||
      "File deleted successfully."
  );
};
  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="page">

      {/* =========================
          PAGE HEADING
      ========================= */}

      <div className="page-heading">
        <h1>Task Details</h1>

        <p>
          View complete information about this task.
        </p>
      </div>

      {/* =========================
          DETAILS CARD
      ========================= */}

      <div className="details-card">

        {/* TITLE */}

        <h1>{task.title}</h1>

        {/* DESCRIPTION */}

        <p>{task.description}</p>

        {/* =========================
            TASK INFORMATION
        ========================= */}

        <div className="details-grid">

          {/* PRIORITY */}

          <div>
            <strong>Priority</strong>

            <p>
              <span
                className={`priority ${
                  task.priority?.toLowerCase() || ""
                }`}
              >
                {task.priority || "Medium"}
              </span>
            </p>
          </div>

          {/* STATUS */}

          <div>
            <strong>Status</strong>

            <p>
              <span className="status">
                {statusText[task.status] ||
                  task.status}
              </span>
            </p>
          </div>

          {/* DEADLINE */}

          <div>
            <strong>Deadline</strong>

            <p>
              {task.deadline
                ? new Date(
                    task.deadline
                  ).toLocaleDateString()
                : "No deadline"}
            </p>

            <span
              className={`deadline-status ${deadlineStatus.className}`}
            >
              {deadlineStatus.text}
            </span>
          </div>

          {/* ASSIGNED BY */}

          <div>
            <strong>Assigned By</strong>

            <p>
              {task.assignedBy?.name || "Admin"}
            </p>
          </div>

        </div>

        {/* =========================
            STATUS ACTION
        ========================= */}

        <div style={{ marginTop: "25px" }}>

          <strong>Update Status</strong>

          {error && (
            <p style={{ color: "red" }}>
              ❌ {error}
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "10px",
              flexWrap: "wrap",
            }}
          >

            {/* PENDING */}

            {task.status !== "pending" && (
              <button
                className="primary-button"
                disabled={updating}
                onClick={() =>
                  handleStatusUpdate("pending")
                }
              >
                {updating
                  ? "Updating..."
                  : "Set Pending"}
              </button>
            )}

            {/* IN PROGRESS */}

            {task.status !== "in-progress" && (
              <button
                className="primary-button"
                disabled={updating}
                onClick={() =>
                  handleStatusUpdate("in-progress")
                }
              >
                {updating
                  ? "Updating..."
                  : "Start Task 🚀"}
              </button>
            )}

            {/* COMPLETED */}

            {task.status !== "completed" && (
              <button
                className="primary-button"
                disabled={updating}
                onClick={() =>
                  handleStatusUpdate("completed")
                }
              >
                {updating
                  ? "Updating..."
                  : "Mark Completed ✅"}
              </button>
            )}

          </div>
        </div>

        {/* =========================
            PROGRESS
        ========================= */}

        <div style={{ marginTop: "25px" }}>

          <div className="progress-header">

            <strong>Progress</strong>

            <span>{progress}%</span>

          </div>

          <div className="progress-bar">

            <div
              style={{
                width: `${progress}%`,
              }}
            ></div>

          </div>

        </div>

        {/* =========================
    RESOURCES FROM ADMIN
========================= */}

{task.resources && task.resources.length > 0 && (
  <div className="task-resources-section">
    <div className="resources-header">
      <div>
        <strong>Resources from Admin</strong>
        <p>
          Documents and links shared with you for this task.
        </p>
      </div>

      <span className="resources-icon">📚</span>
    </div>

    <div className="task-resource-list">
      {task.resources.map((resource) => (
        <div
          className="task-resource-item"
          key={resource._id}
        >
          <div className="task-resource-info">
            <span className="task-resource-icon">
              {resource.type === "file" ? "📄" : "🔗"}
            </span>

            <div>
              <strong>{resource.title}</strong>

              {resource.type === "file" ? (
                <small>
                  {resource.fileName || "Document"}

                  {resource.fileSize
                    ? ` • ${(
                        resource.fileSize /
                        1024 /
                        1024
                      ).toFixed(2)} MB`
                    : ""}
                </small>
              ) : (
                <small>{resource.url}</small>
              )}
            </div>
          </div>

          <div className="task-resource-actions">
            {resource.type === "file" &&
            resource.fileUrl ? (
              <>
                <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="secondary-button"
                >
                  👁️ View
                </a>

                <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={resource.fileName || true}
                  className="primary-button"
                >
                  ⬇️ Download
                </a>
              </>
            ) : resource.type === "url" &&
              resource.url ? (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="primary-button"
              >
                🔗 Open
              </a>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
        {/* =========================
            SUBMIT YOUR WORK
        ========================= */}

        <div className="task-submission-section">

          <div className="submission-header">

            <div>
              <strong>
                Submit Your Work
              </strong>

              <p>
                Upload your completed work or
                supporting files for this task.
              </p>
            </div>

            <span className="submission-icon">
              📎
            </span>

          </div>

          {/* FILE INPUT */}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="submission-file-input"
          />

          {/* SELECTED FILES */}

          {selectedFiles.length > 0 && (
            <div className="selected-files">

              <strong>
                Selected Files (
                {selectedFiles.length}
                )
              </strong>

              <div className="selected-files-list">

                {selectedFiles.map(
                  (file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="selected-file"
                    >

                      <span>📄</span>

                      <div>
                        <strong>
                          {file.name}
                        </strong>

                        <small>
                          {(
                            file.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </small>
                      </div>

                    </div>
                  )
                )}

              </div>
            </div>
          )}

          {/* UPLOAD ERROR */}

          {uploadError && (
            <p className="submission-error">
              ❌ {uploadError}
            </p>
          )}

          {/* UPLOAD SUCCESS */}

          {uploadMessage && (
            <p className="submission-success">
              ✅ {uploadMessage}
            </p>
          )}

          {/* BUTTONS */}

          <div className="submission-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={uploading}
            >
              📎 Choose Files
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={handleFileUpload}
              disabled={
                uploading ||
                selectedFiles.length === 0
              }
            >
              {uploading
                ? "Uploading..."
                : "Upload Files"}
            </button>

          </div>

          <small className="submission-help">
            Maximum 5 files per upload.
            Maximum 25 MB per file.
          </small>

          {/* =========================
    UPLOADED FILES
========================= */}

{task.submissions &&
  task.submissions.length > 0 && (
    <div
      className="uploaded-files"
      style={{
        marginTop: "20px",
      }}
    >
      <strong>
        Uploaded Files (
        {task.submissions.length}
        )
      </strong>

      <div
        className="uploaded-files-list"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginTop: "10px",
        }}
      >
        {task.submissions.map(
          (submission) => (
            <div
              key={submission._id}
              className="uploaded-file"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: "12px",
                padding: "12px",
                border:
                  "1px solid var(--border-color, #ddd)",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: "22px",
                  }}
                >
                  📄
                </span>

                <div
                  style={{
                    minWidth: 0,
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      wordBreak:
                        "break-word",
                    }}
                  >
                    {submission.fileName}
                  </strong>

                  <small>
                    {submission.fileSize
                      ? (
                          submission.fileSize /
                          1024 /
                          1024
                        ).toFixed(2) +
                        " MB"
                      : "File"}
                  </small>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexShrink: 0,
                }}
              >
                <a
                  href={
                    submission.fileUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="secondary-button"
                  style={{
                    textDecoration:
                      "none",
                  }}
                >
                  View
                </a>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() =>
                    handleDeleteFile(
                      submission._id
                    )
                  }
                  disabled={uploading}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )}
        </div>

        {/* =========================
            CREATED DATE
        ========================= */}

        <div style={{ marginTop: "20px" }}>

          <strong>Created</strong>

          <p>
            {task.createdAt
              ? new Date(
                  task.createdAt
                ).toLocaleString()
              : "Not available"}
          </p>

        </div>

        {/* =========================
            BACK BUTTON
        ========================= */}

        <button
          className="primary-button"
          onClick={() => navigate("/tasks")}
          style={{
            marginTop: "25px",
          }}
        >
          ← Back to My Tasks
        </button>

      </div>

    </main>
  );
}

export default TaskDetails;