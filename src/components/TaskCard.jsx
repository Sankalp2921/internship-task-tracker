import React from "react";
import { Link } from "react-router-dom";

function TaskCard({ task }) {
  return (
    <div className="task-card">

      <div className="task-card-top">
        <span className="status">
          {task.status}
        </span>

        <span className={`priority ${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>
      </div>

      <h3>{task.title}</h3>

      <p>{task.description}</p>

      <div className="task-meta">
        <span>💻 {task.technology}</span>
        <span>📅 {task.deadline}</span>
      </div>

      <div className="progress-header">
        <span>Progress</span>
        <strong>{task.progress}%</strong>
      </div>

      <div className="progress-bar">
        <div
          style={{ width: `${task.progress}%` }}
        ></div>
      </div>

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