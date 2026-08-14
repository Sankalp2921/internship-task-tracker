import React, { useState } from "react";
import TaskCard from "../components/TaskCard";
import { useTasks } from "../context/TaskContext";

function Tasks() {

  const { tasks } = useTasks();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filteredTasks = tasks.filter((task) => {

    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      status === "All" ||
      task.status === status;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="page">

      {/* Page Heading */}
      <div className="page-heading">

        <h1>My Tasks</h1>

        <p>
          Search and manage your assigned internship tasks.
        </p>

      </div>


      {/* Search and Filter */}
      <div className="filters">

        <input
          type="text"
          placeholder="🔍 Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >

          <option value="All">
            All
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="In Progress">
            In Progress
          </option>

          <option value="Completed">
            Completed
          </option>

        </select>

      </div>


      {/* Task Cards */}
      <div className="task-grid">

        {filteredTasks.length > 0 ? (

          filteredTasks.map((task) => (

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