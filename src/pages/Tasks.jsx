import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";

import TaskCard from "../components/TaskCard";
import { useTasks } from "../context/TaskContext";


function Tasks({ completedOnly = false }) {

  const { tasks } = useTasks();

  const [search, setSearch] =
    useState("");

  const [searchParams] =
    useSearchParams();


  // ==========================================
  // URL STATUS
  // ==========================================

  const urlStatus =
    searchParams.get("status");


  // ==========================================
  // STATUS FILTER
  // ==========================================

  const [status, setStatus] =
    useState(
      urlStatus || "All"
    );


  // ==========================================
  // SORT PREFERENCE
  // ==========================================

  const sortBy =
    localStorage.getItem(
      "sortBy"
    ) || "recent";


  // ==========================================
  // FILTER TASKS
  // ==========================================

  const filteredTasks =
    tasks.filter((task) => {

      const title =
        task.title || "";

      const matchesSearch =
        title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );


      const matchesStatus =
        completedOnly
          ? task.status ===
            "completed"
          : status === "All" ||
            task.status === status;


      return (
        matchesSearch &&
        matchesStatus
      );

    });


  // ==========================================
  // SORT TASKS
  // ==========================================

  const sortedTasks =
    [...filteredTasks].sort(
      (a, b) => {

        // -------------------------------
        // RECENT
        // -------------------------------

        if (sortBy === "recent") {

          return (
            new Date(
              b.createdAt || 0
            ) -
            new Date(
              a.createdAt || 0
            )
          );

        }


        // -------------------------------
        // DEADLINE
        // -------------------------------

        if (sortBy === "deadline") {

          return (
            new Date(
              a.deadline ||
                "9999-12-31"
            ) -
            new Date(
              b.deadline ||
                "9999-12-31"
            )
          );

        }


        // -------------------------------
        // PRIORITY
        // -------------------------------

        if (sortBy === "priority") {

          const priorityOrder = {
            high: 1,
            High: 1,

            medium: 2,
            Medium: 2,

            low: 3,
            Low: 3,
          };


          return (
            (priorityOrder[
              a.priority
            ] || 99) -
            (priorityOrder[
              b.priority
            ] || 99)
          );

        }


        // -------------------------------
        // STATUS
        // -------------------------------

        if (sortBy === "status") {

          const statusOrder = {
            pending: 1,
            "in-progress": 2,
            completed: 3,
          };


          return (
            (statusOrder[
              a.status
            ] || 99) -
            (statusOrder[
              b.status
            ] || 99)
          );

        }


        return 0;

      }
    );


  // ==========================================
  // PAGE TITLE
  // ==========================================

  const pageTitle =
    completedOnly
      ? "Completed Tasks"
      : "My Tasks";


  const pageDescription =
    completedOnly
      ? "View your completed internship tasks."
      : "Search and manage your assigned internship tasks.";


  // ==========================================
  // TASK COUNTS
  // ==========================================

  const totalTasks =
    tasks.length;

  const completedTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "completed"
    ).length;

  const pendingTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "pending"
    ).length;

  const inProgressTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "in-progress"
    ).length;


  return (
    <main className="page tasks-page">


      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <section className="tasks-page-header">

        <div>

          <span className="dashboard-label">
            INTERNSHIP WORK
          </span>


          <h1>
            {pageTitle}
          </h1>


          <p>
            {pageDescription}
          </p>

        </div>


        {/* TASK SUMMARY */}

        <div className="tasks-summary">

          <div>

            <strong>
              {totalTasks}
            </strong>

            <span>
              Total
            </span>

          </div>


          <div>

            <strong>
              {pendingTasks}
            </strong>

            <span>
              Pending
            </span>

          </div>


          <div>

            <strong>
              {inProgressTasks}
            </strong>

            <span>
              Active
            </span>

          </div>


          <div>

            <strong>
              {completedTasks}
            </strong>

            <span>
              Done
            </span>

          </div>

        </div>

      </section>


      {/* =================================================
          SEARCH + FILTER
      ================================================= */}

      <section className="tasks-toolbar">

        <div className="tasks-search">

          <span>
            🔍
          </span>


          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>


        {!completedOnly && (

          <select
            className="tasks-status-filter"
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
          >

            <option value="All">
              All Tasks
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="in-progress">
              In Progress
            </option>

            <option value="completed">
              Completed
            </option>

          </select>

        )}

      </section>


      {/* =================================================
          RESULT INFORMATION
      ================================================= */}

      <div className="tasks-result-info">

        <span>

          {sortedTasks.length}{" "}

          {sortedTasks.length === 1
            ? "task"
            : "tasks"}{" "}

          found

        </span>


        {search && (

          <span>
            for "
            <strong>
              {search}
            </strong>
            "
          </span>

        )}

      </div>


      {/* =================================================
          TASK CARDS
      ================================================= */}

      {sortedTasks.length > 0 ? (

        <div className="task-grid tasks-grid">

          {sortedTasks.map(
            (task) => (

              <TaskCard
                key={task.id}
                task={task}
              />

            )
          )}

        </div>

      ) : (

        /* =================================================
           EMPTY STATE
        ================================================= */

        <div className="empty-tasks tasks-empty">

          <div className="empty-task-icon">
            {search
              ? "🔍"
              : completedOnly
                ? "✅"
                : "📋"}
          </div>


          <h3>

            {search
              ? "No matching tasks"
              : completedOnly
                ? "No completed tasks yet"
                : status !== "All"
                  ? `No ${status === "in-progress"
                      ? "in-progress"
                      : status} tasks`
                  : "No tasks yet"}

          </h3>


          <p>

            {search
              ? "Try a different search term."
              : completedOnly
                ? "Your completed tasks will appear here."
                : "Tasks assigned to you will appear here."}

          </p>

        </div>

      )}

    </main>
  );
}


export default Tasks;