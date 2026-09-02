import React from "react";
import { Link } from "react-router-dom";

function TaskCard({ task }) {

  // Convert backend status into readable text
  const statusText = {
    pending: "Pending",
    "in-progress": "In Progress",
    completed: "Completed",
  };

  // Calculate progress from status
  const progress =
    task.status === "completed"
      ? 100
      : task.status === "in-progress"
        ? 50
        : 0;

  // Format deadline
  const formattedDeadline = task.deadline
    ? new Date(task.deadline).toLocaleDateString()
    : "No deadline";

  // Calculate deadline status
const getDeadlineStatus = () => {

  if (!task.deadline) {
    return "no-deadline";
  }

  const today = new Date();
  const deadline = new Date(task.deadline);

  // Remove time part
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  const difference =
    deadline.getTime() - today.getTime();

  const daysLeft =
    Math.ceil(
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

  return (
    <div className="task-card">

      {/* =========================
          TOP SECTION
      ========================= */}

      <div className="task-card-top">

        <span className={`status ${task.status}`}>
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

      <h3>
        {task.title}
      </h3>


      {/* =========================
          DESCRIPTION
      ========================= */}

      <p>
        {task.description}
      </p>


      {/* =========================
          META INFORMATION
      ========================= */}

      <div className="task-meta">

        {task.technology && (
          <span>
            💻 {task.technology}
          </span>
        )}

        <span className={`deadline ${deadlineStatus}`}>
          📅 {formattedDeadline}

          {deadlineStatus === "overdue" && (
            <strong> 🔴 Overdue</strong>
          )}

          {deadlineStatus === "due-soon" && (
            <strong> 🟠 Due Soon</strong>
          )}

          {deadlineStatus === "on-track" && (
            <strong> 🟢 On Track</strong>
          )}
        </span>

      </div>


      {/* =========================
          PROGRESS
      ========================= */}

      <div className="progress-header">

        <span>
          Progress
        </span>

        <strong>
          {progress}%
        </strong>

      </div>


      <div className="progress-bar">

        <div
          style={{
            width: `${progress}%`,
          }}
        ></div>

      </div>


      {/* =========================
          VIEW DETAILS
      ========================= */}

      <Link
        className="view-task"
        to={`/tasks/${task.id}`}
      >
        View Details →
      </Link>

    </div>
  );
}

export default TaskCard;