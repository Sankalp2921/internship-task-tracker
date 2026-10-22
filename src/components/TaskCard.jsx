import React from "react";
import { Link } from "react-router-dom";

function TaskCard({ task }) {

  // =========================
  // STATUS
  // =========================

  const statusText = {
    pending: "Pending",
    "in-progress": "In Progress",
    completed: "Completed",
  };

  const statusIcon = {
    pending: "⏳",
    "in-progress": "🚀",
    completed: "✓",
  };

  // =========================
  // PROGRESS
  // =========================

  const progress =
    task.status === "completed"
      ? 100
      : task.status === "in-progress"
        ? 50
        : 0;

  // =========================
  // DEADLINE
  // =========================

  const formattedDeadline = task.deadline
    ? new Date(task.deadline).toLocaleDateString()
    : "No deadline";

  const getDeadlineStatus = () => {

    if (!task.deadline) {
      return "no-deadline";
    }

    const today = new Date();
    const deadline = new Date(task.deadline);

    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    const difference =
      deadline.getTime() - today.getTime();

    const daysLeft = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) {
      return "overdue";
    }

    if (daysLeft <= 2) {
      return "due-soon";
    }

    return "on-track";
  };

  const deadlineStatus = getDeadlineStatus();

  // =========================
  // DEADLINE TEXT
  // =========================

  const deadlineText = {
    overdue: "Overdue",
    "due-soon": "Due Soon",
    "on-track": "On Track",
    "no-deadline": "No Deadline",
  };

  return (
    <article className="task-card advanced-task-card">

      {/* =========================
          TOP
      ========================= */}

      <div className="advanced-task-top">

        <span
          className={`status ${task.status}`}
        >
          <span className="task-status-icon">
            {statusIcon[task.status] || "•"}
          </span>

          {statusText[task.status] || task.status}
        </span>

        <span
          className={`priority ${
            task.priority?.toLowerCase()
          }`}
        >
          {task.priority || "Medium"}
        </span>

      </div>


      {/* =========================
          TITLE
      ========================= */}

      <div className="advanced-task-title">

        <h3>
          {task.title}
        </h3>

      </div>


      {/* =========================
          DESCRIPTION
      ========================= */}

      <p className="advanced-task-description">
        {task.description || "No description provided."}
      </p>


      {/* =========================
          TECHNOLOGY
      ========================= */}

      {task.technology && (
        <div className="task-technology">

          <span className="technology-icon">
            💻
          </span>

          <span>
            {task.technology}
          </span>

        </div>
      )}


      {/* =========================
          DEADLINE
      ========================= */}

      <div
        className={`advanced-task-deadline ${deadlineStatus}`}
      >

        <div className="deadline-left">

          <span className="deadline-icon">
            📅
          </span>

          <span>
            {formattedDeadline}
          </span>

        </div>

        <strong>
          {deadlineText[deadlineStatus]}
        </strong>

      </div>


      {/* =========================
          PROGRESS
      ========================= */}

      <div className="advanced-progress-header">

        <span>
          Task Progress
        </span>

        <strong>
          {progress}%
        </strong>

      </div>

      <div className="advanced-progress-bar">

        <div
          style={{
            width: `${progress}%`,
          }}
        ></div>

      </div>


      {/* =========================
          FOOTER
      ========================= */}

      <div className="advanced-task-footer">

        <span className="task-progress-text">
          {progress === 100
            ? "Task completed"
            : progress === 50
              ? "Work in progress"
              : "Waiting to start"}
        </span>

        <Link
          className="advanced-view-task"
          to={`/tasks/${task.id}`}
        >
          View Details
          <span>→</span>
        </Link>

      </div>

    </article>
  );
}

export default TaskCard;