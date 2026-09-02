import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTasks } from "../context/TaskContext";

function TaskDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const {
    tasks,
    loading,
    updateTaskStatus
  } = useTasks();

  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <main className="page">

        <div className="details-card">

          <h1>
            Loading Task...
          </h1>

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
    (task) =>
      task.id?.toString() === id
  );


  // ==========================================
  // TASK NOT FOUND
  // ==========================================

  if (!task) {

    return (
      <main className="page">

        <div className="details-card">

          <h1>
            Task Not Found
          </h1>

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

  const daysLeft =
    Math.ceil(
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


  return (
    <main className="page">


      {/* =========================
          PAGE HEADING
      ========================= */}

      <div className="page-heading">

        <h1>
          Task Details
        </h1>

        <p>
          View complete information about this task.
        </p>

      </div>


      {/* =========================
          DETAILS CARD
      ========================= */}

      <div className="details-card">


        {/* TITLE */}

        <h1>
          {task.title}
        </h1>


        {/* DESCRIPTION */}

        <p>
          {task.description}
        </p>


        {/* =========================
            TASK INFORMATION
        ========================= */}

        <div className="details-grid">


          {/* PRIORITY */}

          <div>

            <strong>
              Priority
            </strong>

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


          {/* STATUS */}

          <div>

            <strong>
              Status
            </strong>

            <p>

              <span className="status">

                {statusText[task.status] ||
                  task.status}

              </span>

            </p>

          </div>


          {/* DEADLINE */}

          <div>

  <strong>
    Deadline
  </strong>

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

            <strong>
              Assigned By
            </strong>

            <p>

              {task.assignedBy?.name ||
                "Admin"}

            </p>

          </div>

        </div>


        {/* =========================
            STATUS ACTION
        ========================= */}

        <div style={{ marginTop: "25px" }}>

          <strong>
            Update Status
          </strong>


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

            <strong>
              Progress
            </strong>

            <span>
              {progress}%
            </span>

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
            CREATED DATE
        ========================= */}

        <div style={{ marginTop: "20px" }}>

          <strong>
            Created
          </strong>

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