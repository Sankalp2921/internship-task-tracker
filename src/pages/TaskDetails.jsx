import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTasks } from "../context/TaskContext";

function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { tasks } = useTasks();

  // Find the task using the ID from the URL
  const task = tasks.find(
    (task) => task.id.toString() === id
  );

  // If task doesn't exist
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

  return (
    <main className="page">

      <div className="page-heading">

        <h1>Task Details</h1>

        <p>
          View complete information about this task.
        </p>

      </div>


      <div className="details-card">

        {/* Title */}

        <h1>
          {task.title}
        </h1>


        {/* Description */}

        <p>
          {task.description}
        </p>


        {/* Task Information */}

        <div className="details-grid">

          <div>
            <strong>Technology</strong>

            <p>
              {task.technology || "Not specified"}
            </p>
          </div>


          <div>
            <strong>Priority</strong>

            <p>
              <span
                className={`priority ${
                  task.priority?.toLowerCase()
                }`}
              >
                {task.priority || "Medium"}
              </span>
            </p>
          </div>


          <div>
            <strong>Status</strong>

            <p>
              <span className="status">
                {task.status}
              </span>
            </p>
          </div>


          <div>
            <strong>Deadline</strong>

            <p>
              {task.deadline || "No deadline"}
            </p>
          </div>

        </div>


        {/* Progress */}

        <div>

          <div className="progress-header">

            <strong>
              Progress
            </strong>

            <span>
              {task.progress || 0}%
            </span>

          </div>


          <div className="progress-bar">

            <div
              style={{
                width: `${task.progress || 0}%`
              }}
            ></div>

          </div>

        </div>


        {/* Back Button */}

        <button
          className="primary-button"
          onClick={() => navigate("/tasks")}
          style={{ marginTop: "25px" }}
        >
          ← Back to My Tasks
        </button>

      </div>

    </main>
  );
}

export default TaskDetails;