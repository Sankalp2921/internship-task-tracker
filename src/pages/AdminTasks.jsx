import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ==========================================
// API URL
// ==========================================

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5001"
).replace(/\/$/, "");


function AdminTasks() {

  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const [searchParams] = useSearchParams();

  const urlStatus = searchParams.get("status");

  const [status, setStatus] = useState(
    urlStatus || "All"
  );


  // ==========================================
  // EDIT STATE
  // ==========================================

  const [editingTask, setEditingTask] = useState(null);

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    deadline: "",
  });


  // ==========================================
  // GET ALL TASKS
  // ==========================================

  const loadTasks = async () => {

    if (!user || !user.token) {

      setError("You are not logged in.");
      setLoading(false);

      return;
    }


    try {

      const response = await fetch(
        `${API_URL}/api/tasks/admin/all`,
        {
          method: "GET",

          headers: {
            "Authorization": `Bearer ${user.token}`,
          },
        }
      );


      const data = await response.json();


      if (!response.ok) {

        setError(
          data.message ||
          "Unable to fetch tasks."
        );

        return;
      }


      setTasks(data.tasks);


    } catch (error) {

      console.error(
        "Fetch admin tasks error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );


    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // LOAD TASKS
  // ==========================================

  useEffect(() => {

    loadTasks();

  }, [user]);


  // ==========================================
  // DELETE TASK
  // ==========================================

  const handleDelete = async (taskId) => {

    setError("");
    setSuccess("");


    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );


    if (!confirmDelete) {
      return;
    }


    try {

      const response = await fetch(
        `${API_URL}/api/tasks/admin/${taskId}`,
        {
          method: "DELETE",

          headers: {
            "Authorization": `Bearer ${user.token}`,
          },
        }
      );


      const data = await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Unable to delete task."
        );

        return;
      }


      alert("Task deleted successfully.");


      // Remove deleted task from UI

      setTasks((previousTasks) =>
        previousTasks.filter(
          (task) => task._id !== taskId
        )
      );


    } catch (error) {

      console.error(
        "Delete task error:",
        error
      );

      alert(
        "Unable to connect to the server."
      );

    }

  };


  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  const handleEdit = (task) => {

    setEditingTask(task);

    setEditForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      deadline: task.deadline
        ? task.deadline.substring(0, 10)
        : "",
    });

  };


  // ==========================================
  // EDIT INPUT CHANGE
  // ==========================================

  const handleEditChange = (e) => {

    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });

  };


  // ==========================================
  // UPDATE TASK
  // ==========================================

  const handleUpdate = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");


    try {

      const response = await fetch(
        `${API_URL}/api/tasks/admin/${editingTask._id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}`,
          },

          body: JSON.stringify(editForm),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Unable to update task."
        );

        return;
      }


      alert("Task updated successfully.");


      // Update task in UI

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task._id === editingTask._id
            ? data.task
            : task
        )
      );


      // Close edit form

      setEditingTask(null);


    } catch (error) {

      console.error(
        "Update task error:",
        error
      );

      alert(
        "Unable to connect to the server."
      );

    }

  };


  // ==========================================
  // FILTER TASKS
  // ==========================================

  const filteredTasks = tasks.filter((task) => {

    const matchesSearch = task.title
      ?.toLowerCase()
      .includes(search.toLowerCase());


    const matchesStatus =
      status === "All" ||
      task.status === status;


    return matchesSearch && matchesStatus;

  });


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <main className="page">

        <div className="details-card">

          <h1>
            Loading Tasks...
          </h1>

          <p>
            Please wait while we load all tasks.
          </p>

        </div>

      </main>
    );

  }


  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="page">

      {/* =========================
          HEADING
      ========================= */}

      <div className="page-heading">

        <h1>
          All Tasks
        </h1>

        <p>
          View and manage all internship tasks.
        </p>

      </div>


      {/* =========================
          ERROR
      ========================= */}

      {error && (

        <div className="auth-error">
          ❌ {error}
        </div>

      )}


      {success && (

        <div className="success-message">
          ✅ {success}
        </div>

      )}


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

      </div>


      {/* =========================
          NO TASKS
      ========================= */}

      {filteredTasks.length === 0 ? (

        <div className="empty-tasks">

          <div className="empty-task-icon">
            📋
          </div>

          <h3>
            No tasks yet
          </h3>

          <p>
            No tasks match your search or filter.
          </p>

        </div>

      ) : (

        <div className="task-grid">

          {filteredTasks.map((task) => (

            <div
              className="details-card"
              key={task._id}
            >

              {/* TITLE */}

              <h2>
                {task.title}
              </h2>


              {/* DESCRIPTION */}

              <p>
                {task.description}
              </p>


              {/* TASK INFORMATION */}

              <div className="details-grid">

                <div>

                  <strong>
                    Assigned To
                  </strong>

                  <p>
                    {task.assignedTo?.name ||
                      "Unknown"}
                  </p>

                </div>


                <div>

                  <strong>
                    Email
                  </strong>

                  <p>
                    {task.assignedTo?.email ||
                      "Unknown"}
                  </p>

                </div>


                <div>

                  <strong>
                    Status
                  </strong>

                  <p>
                    {task.status}
                  </p>

                </div>


                <div>

                  <strong>
                    Priority
                  </strong>

                  <p>
                    {task.priority}
                  </p>

                </div>


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

                </div>

              </div>


              {/* =========================
                  ACTION BUTTONS
              ========================= */}

              <div className="task-actions">

                <button
                  className="edit-button"
                  onClick={() =>
                    handleEdit(task)
                  }
                >
                  ✏️ Edit
                </button>


                <button
                  className="delete-button"
                  onClick={() =>
                    handleDelete(task._id)
                  }
                >
                  🗑️ Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      )}


      {/* =========================
          EDIT FORM
      ========================= */}

      {editingTask && (

        <div className="edit-modal">

          <div className="edit-modal-content">

            <h2>
              Edit Task
            </h2>


            <form
              onSubmit={handleUpdate}
              className="task-form"
            >

              {/* TITLE */}

              <input
                type="text"
                name="title"
                placeholder="Task title"
                value={editForm.title}
                onChange={handleEditChange}
                required
              />


              {/* DESCRIPTION */}

              <textarea
                name="description"
                placeholder="Task description"
                value={editForm.description}
                onChange={handleEditChange}
                required
              />


              {/* PRIORITY */}

              <select
                name="priority"
                value={editForm.priority}
                onChange={handleEditChange}
              >

                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>

              </select>


              {/* DEADLINE */}

              <input
                type="date"
                name="deadline"
                value={editForm.deadline}
                onChange={handleEditChange}
              />


              {/* BUTTONS */}

              <div className="task-actions">

                <button
                  type="submit"
                  className="edit-button"
                >
                  💾 Save Changes
                </button>


                <button
                  type="button"
                  className="delete-button"
                  onClick={() =>
                    setEditingTask(null)
                  }
                >
                  ❌ Cancel
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}

export default AdminTasks;