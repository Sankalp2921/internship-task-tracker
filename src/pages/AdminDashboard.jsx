import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";

// ==========================================
// API URL
// ==========================================

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5001"
).replace(/\/$/, "");


function AdminDashboard() {

  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalTasks: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ==========================================
  // LOAD ADMIN DASHBOARD DATA
  // ==========================================

  useEffect(() => {

    const loadDashboard = async () => {

      if (!user || !user.token) {

        setError("You are not logged in.");

        setLoading(false);

        return;
      }


      try {

        setLoading(true);


        // ======================================
        // GET TASK STATISTICS
        // ======================================

        const statsResponse = await fetch(
          `${API_URL}/api/tasks/admin/stats`,
          {
            method: "GET",

            headers: {
              "Authorization": `Bearer ${user.token}`,
            },
          }
        );


        const statsData =
          await statsResponse.json();


        if (!statsResponse.ok) {

          setError(
            statsData.message ||
            "Unable to fetch task statistics."
          );

          return;
        }


        setStats(statsData.stats);


        // ======================================
        // GET ALL TASKS
        // ======================================

        const tasksResponse = await fetch(
          `${API_URL}/api/tasks/admin/all`,
          {
            method: "GET",

            headers: {
              "Authorization": `Bearer ${user.token}`,
            },
          }
        );


        const tasksData =
          await tasksResponse.json();


        if (!tasksResponse.ok) {

          setError(
            tasksData.message ||
            "Unable to fetch tasks."
          );

          return;
        }


        setTasks(tasksData.tasks);


      } catch (error) {

        console.error(
          "Admin dashboard error:",
          error
        );

        setError(
          "Unable to connect to the server."
        );

      } finally {

        setLoading(false);

      }

    };


    loadDashboard();

  }, [user]);


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <main className="page">

        <div className="details-card">

          <h1>
            Loading Admin Dashboard...
          </h1>

          <p>
            Please wait while we load the data.
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
          Admin Dashboard
        </h1>

        <p>
          Manage tasks and monitor internship progress.
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


      {/* =========================
          STATISTICS
      ========================= */}

      <div className="stats-grid">

        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon="📋"
        />

        <StatCard
          title="Pending"
          value={stats.pending}
          icon="⏳"
        />

        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon="🚀"
        />

        <StatCard
          title="Completed"
          value={stats.completed}
          icon="✅"
        />

      </div>


      {/* =========================
          ALL TASKS
      ========================= */}

      <h2 className="section-title">
        All Tasks
      </h2>


      {tasks.length === 0 ? (

        <div className="empty-tasks">

          <div className="empty-task-icon">
            📋
          </div>

          <h3>
            No tasks yet
          </h3>

          <p>
            No tasks have been assigned yet.
          </p>

        </div>

      ) : (

        <div className="task-grid">

          {tasks.map((task) => (

            <div
              className="details-card"
              key={task._id}
            >

              <h2>
                {task.title}
              </h2>

              <p>
                {task.description}
              </p>


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

            </div>

          ))}

        </div>

      )}

    </main>
  );
}

export default AdminDashboard;