import React from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";

import StatCard from "../components/StatCard";
import TaskCard from "../components/TaskCard";
import AttendanceCard from "../components/AttendanceCard";

function Dashboard() {

  const { tasks } = useTasks();

  const navigate = useNavigate();

  const { user } = useAuth();


  // ==========================================
  // TASK STATISTICS
  // ==========================================

  const total = tasks.length;

  const pending = tasks.filter(
    (task) =>
      task.status === "pending"
  ).length;

  const inProgress = tasks.filter(
    (task) =>
      task.status === "in-progress"
  ).length;

  const completed = tasks.filter(
    (task) =>
      task.status === "completed"
  ).length;


  // ==========================================
  // OVERALL PROGRESS
  // ==========================================

  const progressPercentage =
    total === 0
      ? 0
      : Math.round(
          (completed / total) * 100
        );


  const remaining =
    Math.max(
      total - completed,
      0
    );


  // ==========================================
  // RECENT TASKS
  // ==========================================

  const recentTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(
          b.createdAt || 0
        ) -
        new Date(
          a.createdAt || 0
        )
    )
    .slice(0, 3);


  // ==========================================
  // USER NAME
  // ==========================================

  const userName =
    user?.name
      ?.split(" ")[0] ||
    "there";


  // ==========================================
  // PROGRESS MESSAGE
  // ==========================================

  const progressMessage =
    total === 0
      ? "No tasks assigned yet"
      : progressPercentage === 100
        ? "Excellent work! All your tasks are completed 🎉"
        : progressPercentage >= 75
          ? "You're almost there. Keep up the great work! 🚀"
          : progressPercentage >= 50
            ? "You're making strong progress. Keep going! 💪"
            : "Stay focused and complete your pending tasks!";


  return (
    <main className="page dashboard-page">


      {/* =================================================
          WELCOME HEADER
      ================================================= */}

      <section className="dashboard-welcome">

        <div className="dashboard-welcome-content">

          <span className="dashboard-label">
            INTERNSHIP DASHBOARD
          </span>


          <h1>
            Welcome back, {userName} 👋
          </h1>


          <p>
            Track your internship tasks,
            monitor your progress, and
            stay on top of your work.
          </p>

        </div>


        {/* OVERALL SUMMARY */}

        <div className="dashboard-date-card">

          <span>
            Overall Progress
          </span>


          <strong>
            {progressPercentage}%
          </strong>


          <small>
            {completed} of {total} tasks completed
          </small>

        </div>

      </section>


      {/* =================================================
          TASK OVERVIEW
      ================================================= */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>

            <h2>
              Task Overview
            </h2>


            <p>
              Keep track of your assigned
              internship work.
            </p>

          </div>


          <button
            className="dashboard-view-all"
            onClick={() =>
              navigate("/tasks")
            }
          >
            View All Tasks →
          </button>

        </div>


        {/* STAT CARDS */}

        <div className="stats-grid">

          <StatCard
            title="Total Tasks"
            value={total}
            icon="📋"
            onClick={() =>
              navigate("/tasks")
            }
          />


          <StatCard
            title="Pending"
            value={pending}
            icon="⏳"
            onClick={() =>
              navigate(
                "/tasks?status=pending"
              )
            }
          />


          <StatCard
            title="In Progress"
            value={inProgress}
            icon="🚀"
            onClick={() =>
              navigate(
                "/tasks?status=in-progress"
              )
            }
          />


          <StatCard
            title="Completed"
            value={completed}
            icon="✅"
            onClick={() =>
              navigate("/completed")
            }
          />

        </div>

      </section>

      {/* =================================================
    ATTENDANCE
================================================= */}

<AttendanceCard />

      {/* =================================================
          PROGRESS + FOCUS
      ================================================= */}

      <section className="dashboard-main-grid">


        {/* ===============================================
            PROGRESS CARD
        =============================================== */}

        <div className="overall-progress dashboard-progress">

          <div className="overall-progress-header">

            <div>

              <span className="dashboard-card-label">
                YOUR PERFORMANCE
              </span>


              <h2>
                Internship Progress
              </h2>


              <p>
                {completed} of {total} tasks completed
              </p>

            </div>


            <div className="progress-percentage">
              {progressPercentage}%
            </div>

          </div>


          {/* PROGRESS BAR */}

          <div className="overall-progress-bar">

            <div
              style={{
                width:
                  `${progressPercentage}%`,
              }}
            />

          </div>


          {/* PROGRESS FOOTER */}

          <div className="progress-footer">

            <span>
              {progressMessage}
            </span>


            <strong>
              {remaining} remaining
            </strong>

          </div>


          {/* STATUS SUMMARY */}

          <div
            className="dashboard-progress-summary"
          >

            <div>

              <span>
                Pending
              </span>

              <strong>
                {pending}
              </strong>

            </div>


            <div>

              <span>
                In Progress
              </span>

              <strong>
                {inProgress}
              </strong>

            </div>


            <div>

              <span>
                Completed
              </span>

              <strong>
                {completed}
              </strong>

            </div>

          </div>

        </div>


        {/* ===============================================
            FOCUS CARD
        =============================================== */}

        <div className="dashboard-info-card">

          <div className="dashboard-info-icon">
            🎯
          </div>


          <div>

            <span className="dashboard-card-label">
              FOCUS
            </span>


            <h3>
              Stay on track
            </h3>


            <p>
              Complete your pending tasks,
              update your progress, and
              submit your work on time.
            </p>

          </div>


          <button
            className="dashboard-info-button"
            onClick={() =>
              navigate("/tasks")
            }
          >
            Open My Tasks →
          </button>

        </div>

      </section>


      {/* =================================================
          RECENT TASKS
      ================================================= */}

      <section className="dashboard-section recent-tasks-section">

        <div className="section-heading">

          <div>

            <h2>
              Recent Tasks
            </h2>


            <p>
              Your latest assigned
              internship tasks.
            </p>

          </div>


          {tasks.length > 0 && (

            <button
              className="dashboard-view-all"
              onClick={() =>
                navigate("/tasks")
              }
            >
              View All →
            </button>

          )}

        </div>


        {/* ===============================================
            NO TASKS
        =============================================== */}

        {tasks.length === 0 ? (

          <div className="empty-tasks dashboard-empty">

            <div className="empty-task-icon">
              📋
            </div>


            <h3>
              No tasks yet
            </h3>


            {user?.role === "admin" ? (

              <>

                <p>
                  Please add your first
                  task to get started.
                </p>


                <button
                  className="primary-button"
                  onClick={() =>
                    navigate(
                      "/add-task"
                    )
                  }
                >
                  + Add Task
                </button>

              </>

            ) : (

              <p>
                No tasks have been
                assigned to you yet.
              </p>

            )}

          </div>

        ) : (

          /* =============================================
             RECENT TASK GRID
          ============================================= */

          <div className="task-grid dashboard-task-grid">

            {recentTasks.map(
              (task) => (

                <TaskCard
                  key={task.id}
                  task={task}
                />

              )
            )}

          </div>

        )}

      </section>

    </main>
  );
}


export default Dashboard;