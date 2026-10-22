
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5001"
).replace(/\/+$/, "");

const formatTime = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDistance = (meters) => {
  if (meters === null || meters === undefined || !Number.isFinite(Number(meters))) {
    return "Not recorded";
  }

  const distance = Number(meters);

  return distance < 1000
    ? `${Math.round(distance)} m`
    : `${(distance / 1000).toFixed(2)} km`;
};

const formatMinutes = (minutes) => {
  const value = Number(minutes) || 0;
  const hours = Math.floor(value / 60);
  const remainingMinutes = value % 60;

  return `${hours}h ${remainingMinutes}m`;
};

function AdminDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalTasks: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    })
  );

  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [error, setError] = useState("");
  const [attendanceError, setAttendanceError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${user.token}`,
        };

        const [statsResponse, tasksResponse] = await Promise.all([
          fetch(`${API_URL}/api/tasks/admin/stats`, { headers }),
          fetch(`${API_URL}/api/tasks/admin/all`, { headers }),
        ]);

        const statsData = await statsResponse.json();
        const tasksData = await tasksResponse.json();

        if (!statsResponse.ok) {
          throw new Error(
            statsData.message || "Unable to fetch task statistics."
          );
        }

        if (!tasksResponse.ok) {
          throw new Error(tasksData.message || "Unable to fetch tasks.");
        }

        setStats(statsData.stats);
        setTasks(tasksData.tasks || []);
      } catch (error) {
        console.error("Admin dashboard error:", error);
        setError(error.message || "Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  useEffect(() => {
    const loadAttendance = async () => {
      if (!user?.token || !attendanceDate) return;

      try {
        setAttendanceLoading(true);
        setAttendanceError("");

        const response = await fetch(
          `${API_URL}/api/admin/attendance?date=${encodeURIComponent(
            attendanceDate
          )}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to fetch employee attendance."
          );
        }

        setAttendance(data.attendance || []);
      } catch (error) {
        console.error("Admin attendance error:", error);
        setAttendanceError(
          error.message || "Unable to load employee attendance."
        );
        setAttendance([]);
      } finally {
        setAttendanceLoading(false);
      }
    };

    loadAttendance();
  }, [user, attendanceDate]);

  if (loading) {
    return (
      <main className="page">
        <div className="details-card">
          <h1>Loading Admin Dashboard...</h1>
          <p>Please wait while we load the data.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-heading">
        <h1>Admin Dashboard</h1>
        <p>Manage tasks and monitor internship progress.</p>
      </div>

      {error && <div className="auth-error">❌ {error}</div>}

      <div className="stats-grid">
        <StatCard title="Total Tasks" value={stats.totalTasks} icon="📋" />
        <StatCard title="Pending" value={stats.pending} icon="⏳" />
        <StatCard title="In Progress" value={stats.inProgress} icon="🚀" />
        <StatCard title="Completed" value={stats.completed} icon="✅" />
      </div>

      {/* ADMIN EMPLOYEE ATTENDANCE */}
      <section className="admin-attendance-section">
        <h2 className="section-title">Employee Attendance</h2>

        <div className="attendance-date-filter">
          <label htmlFor="admin-attendance-date">Attendance date</label>
          <input
            id="admin-attendance-date"
            type="date"
            value={attendanceDate}
            onChange={(event) => setAttendanceDate(event.target.value)}
          />
        </div>

        {attendanceError && (
          <div className="auth-error">❌ {attendanceError}</div>
        )}

        {attendanceLoading ? (
          <div className="details-card">Loading employee attendance...</div>
        ) : (
          <div className="attendance-table-wrapper">
            <table className="admin-attendance-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Working hours</th>
                  <th>Status</th>
                  <th>Distance from office</th>
                </tr>
              </thead>

              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan="6">No employees found.</td>
                  </tr>
                ) : (
                  attendance.map((item) => (
                    <tr key={item.employee._id}>
                      <td>
                        <strong>{item.employee.name}</strong>
                        <br />
                        <small>{item.employee.email}</small>
                      </td>
                      <td>{formatTime(item.checkIn)}</td>
                      <td>{formatTime(item.checkOut)}</td>
                      <td>{formatMinutes(item.workingMinutes)}</td>
                      <td>
                        <span
                          className={`attendance-status status-${String(
                            item.status
                          ).toLowerCase()}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div>
                          <strong>In:</strong>{" "}
                          {formatDistance(item.checkInDistanceMeters)}
                        </div>
                        <div>
                          <strong>Out:</strong>{" "}
                          {formatDistance(item.checkOutDistanceMeters)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* EXISTING TASKS */}
      <h2 className="section-title">All Tasks</h2>

      {tasks.length === 0 ? (
        <div className="empty-tasks">
          <div className="empty-task-icon">📋</div>
          <h3>No tasks yet</h3>
          <p>No tasks have been assigned yet.</p>
        </div>
      ) : (
        <div className="task-grid">
          {tasks.map((task) => (
            <div className="details-card" key={task._id}>
              <h2>{task.title}</h2>
              <p>{task.description}</p>

              <div className="details-grid">
                <div>
                  <strong>Assigned To</strong>
                  <p>{task.assignedTo?.name || "Unknown"}</p>
                </div>

                <div>
                  <strong>Email</strong>
                  <p>{task.assignedTo?.email || "Unknown"}</p>
                </div>

                <div>
                  <strong>Status</strong>
                  <p>{task.status}</p>
                </div>

                <div>
                  <strong>Priority</strong>
                  <p>{task.priority}</p>
                </div>

                <div>
                  <strong>Deadline</strong>
                  <p>
                    {task.deadline
                      ? new Date(task.deadline).toLocaleDateString()
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
