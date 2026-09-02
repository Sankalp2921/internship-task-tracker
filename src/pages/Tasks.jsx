import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import TaskCard from "../components/TaskCard";
import { useTasks } from "../context/TaskContext";

function Tasks({ completedOnly = false }) {

  const { tasks } = useTasks();

  const [search, setSearch] = useState("");

  const [searchParams] = useSearchParams();


  // ==========================================
  // GET STATUS FROM URL
  // ==========================================

  const urlStatus = searchParams.get("status");


  // ==========================================
  // INITIAL STATUS
  // ==========================================

  const [status, setStatus] = useState(
    urlStatus || "All"
  );


  // ==========================================
  // GET SORT PREFERENCE
  // ==========================================

  const sortBy =
    localStorage.getItem("sortBy") || "recent";


  // ==========================================
  // FILTER TASKS
  // ==========================================

  const filteredTasks = tasks.filter((task) => {

    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());


    const matchesStatus =
      completedOnly
        ? task.status === "completed"
        : status === "All" ||
          task.status === status;


    return matchesSearch && matchesStatus;

  });


  // ==========================================
  // SORT TASKS
  // ==========================================

  const sortedTasks = [...filteredTasks].sort(
    (a, b) => {

      // -------------------------------
      // RECENTLY ADDED
      // -------------------------------

      if (sortBy === "recent") {

        return (
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
        );

      }


      // -------------------------------
      // DEADLINE
      // -------------------------------

      if (sortBy === "deadline") {

        return (
          new Date(
            a.deadline || "9999-12-31"
          ) -
          new Date(
            b.deadline || "9999-12-31"
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
          (priorityOrder[a.priority] || 99) -
          (priorityOrder[b.priority] || 99)
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
          (statusOrder[a.status] || 99) -
          (statusOrder[b.status] || 99)
        );

      }


      return 0;

    }
  );


  return (
    <main className="page">


      {/* =========================
          PAGE HEADING
      ========================= */}

      <div className="page-heading">

        <h1>
          {completedOnly
            ? "Completed Tasks"
            : "My Tasks"}
        </h1>

        <p>
          {completedOnly
            ? "View your completed internship tasks."
            : "Search and manage your assigned internship tasks."}
        </p>

      </div>


      {/* =========================
          SEARCH AND FILTER
      ========================= */}

      <div className="filters">

        <input
          type="text"
          placeholder="🔍 Search tasks..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />


        {!completedOnly && (

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
          >

            <option value="All">
              All
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

      </div>


      {/* =========================
          TASK CARDS
      ========================= */}

      <div className="task-grid">

        {sortedTasks.length > 0 ? (

          sortedTasks.map((task) => (

            <TaskCard
              key={task.id}
              task={task}
            />

          ))

        ) : (

          <p>
            No tasks found.
          </p>

        )}

      </div>

    </main>
  );
}


export default Tasks;