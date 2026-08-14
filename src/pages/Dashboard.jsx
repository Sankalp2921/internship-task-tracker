import React from "react";
import { useNavigate } from "react-router-dom";

import StatCard from "../components/StatCard";
import TaskCard from "../components/TaskCard";

import { useTasks } from "../context/TaskContext";

function Dashboard() {
  const { tasks } = useTasks();

  const navigate = useNavigate();

  const total = tasks.length;

  const pending = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completed = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  return (
    <main className="page">

      {/* =========================
          HEADING
      ========================= */}

      <div className="page-heading">

        <h1>Dashboard</h1>

        <p>
          Track your internship work and progress.
        </p>

      </div>


      {/* =========================
          STATISTICS
      ========================= */}

      <div className="stats-grid">

        <StatCard
          title="Total Tasks"
          value={total}
          icon="📋"
        />

        <StatCard
          title="Pending"
          value={pending}
          icon="⏳"
        />

        <StatCard
          title="In Progress"
          value={inProgress}
          icon="🚀"
        />

        <StatCard
          title="Completed"
          value={completed}
          icon="✅"
        />

      </div>


      {/* =========================
          TASKS
      ========================= */}

      <h2 className="section-title">
        Recent Tasks
      </h2>


      {/* NO TASKS */}
      {tasks.length === 0 ? (

        <div className="empty-tasks">

          <div className="empty-task-icon">
            📋
          </div>

          <h3>
            No tasks yet
          </h3>

          <p>
            Please add your first task to get started.
          </p>

          <button
            className="primary-button"
            onClick={() => navigate("/add-task")}
          >
            + Add Task
          </button>

        </div>

      ) : (

        /* TASKS EXIST */

        <div className="task-grid">

          {tasks.map((task) => (

            <TaskCard
              key={task.id}
              task={task}
            />

          ))}

        </div>

      )}

    </main>
  );
}

export default Dashboard;