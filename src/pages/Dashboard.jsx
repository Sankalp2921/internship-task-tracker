import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import TaskCard from "../components/TaskCard";

import { useTasks } from "../context/TaskContext";

function Dashboard() {
const { tasks } = useTasks();

  const navigate = useNavigate();
  const { user } = useAuth();
  const total = tasks.length;

  const pending = tasks.filter(
  (task) => task.status === "pending"
).length;

const inProgress = tasks.filter(
  (task) => task.status === "in-progress"
).length;

const completed = tasks.filter(
  (task) => task.status === "completed"
).length;

const progressPercentage =
  total === 0
    ? 0
    : Math.round((completed / total) * 100);

const recentTasks = [...tasks]
  .sort(
    (a, b) =>
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
  )
  .slice(0, 3);
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
    onClick={() => navigate("/tasks")}
  />

  <StatCard
    title="Pending"
    value={pending}
    icon="⏳"
    onClick={() => navigate("/tasks?status=pending")}
  />

  <StatCard
    title="In Progress"
    value={inProgress}
    icon="🚀"
    onClick={() => navigate("/tasks?status=in-progress")}
  />

  <StatCard
    title="Completed"
    value={completed}
    icon="✅"
    onClick={() => navigate("/completed")}
  />

</div>


      {/* =========================
          TASKS
      ========================= */}
      {/* =========================
    OVERALL PROGRESS
========================= */}

<div className="overall-progress">

  <div className="overall-progress-header">

    <div>
      <h2>
        Your Progress
      </h2>

      <p>
        {completed} of {total} tasks completed
      </p>
    </div>

    <strong>
      {progressPercentage}%
    </strong>

  </div>


  <div className="overall-progress-bar">

    <div
      style={{
        width: `${progressPercentage}%`,
      }}
    ></div>

  </div>

</div>

      <h2 className="section-title">
        Recent Tasks
      </h2>


      {/* NO TASKS */}
      {/* NO TASKS */}
{tasks.length === 0 ? (

  <div className="empty-tasks">

    <div className="empty-task-icon">
      📋
    </div>

    <h3>
      No tasks yet
    </h3>

    {user?.role === "admin" ? (
      <>
        <p>
          Please add your first task to get started.
        </p>

        <button
          className="primary-button"
          onClick={() => navigate("/add-task")}
        >
          + Add Task
        </button>
      </>
    ) : (
      <p>
        No tasks have been assigned to you yet.
      </p>
    )}

  </div>

) : (

  <div className="task-grid">

    {recentTasks.map((task) => (

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