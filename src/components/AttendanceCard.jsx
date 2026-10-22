
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function AttendanceCard() {
  const { user } = useAuth();

  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5001"
  ).replace(/\/$/, "");

  // ==========================================
  // GET TODAY'S ATTENDANCE
  // ==========================================

  const fetchTodayAttendance = async () => {
    if (!user?.token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/attendance/today`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setAttendance(data.attendance);
      } else {
        setMessage(
          data.message || "Unable to load attendance."
        );
      }
    } catch (error) {
      console.error("Get attendance error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, [user?.token]);

  // ==========================================
  // CHECK IN
  // ==========================================

  const handleCheckIn = async () => {
    if (!user?.token) return;

    setActionLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/attendance/check-in`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Check-in failed.");
        return;
      }

      setAttendance(data.attendance);
      setMessage("Check-in successful.");
    } catch (error) {
      console.error("Check-in error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // CHECK OUT
  // ==========================================

  const handleCheckOut = async () => {
    if (!user?.token) return;

    setActionLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/attendance/check-out`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Check-out failed.");
        return;
      }

      setAttendance(data.attendance);
      setMessage("Check-out successful.");
    } catch (error) {
      console.error("Check-out error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatTime = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ==========================================
  // FORMAT WORKING HOURS
  // ==========================================

  const formatWorkingTime = (totalMinutes = 0) => {
    const total = Math.max(0, Number(totalMinutes) || 0);
    const hours = Math.floor(total / 60);
    const minutes = total % 60;

    return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  };

  // ==========================================
  // SHARED CARD STYLES
  // ==========================================

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "24px",
    margin: "24px 0",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "22px",
  };

  const iconStyle = {
    background: "#eff6ff",
    borderRadius: "12px",
    padding: "12px",
    fontSize: "25px",
    flexShrink: 0,
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <section style={cardStyle}>
        <div style={headerStyle}>
          <div>
            <span className="dashboard-card-label">
              ATTENDANCE
            </span>
            <h2 style={{ margin: "6px 0", color: "#172033" }}>
              Today's Attendance
            </h2>
          </div>

          <span style={iconStyle}>🕐</span>
        </div>

        <p style={{ color: "#64748b", marginBottom: 0 }}>
          Loading attendance...
        </p>
      </section>
    );
  }

  // ==========================================
  // MAIN CARD
  // ==========================================

  const attendanceStats = [
    {
      label: "Check In",
      value: formatTime(attendance?.checkIn),
      icon: "🟢",
    },
    {
      label: "Check Out",
      value: formatTime(attendance?.checkOut),
      icon: "🔴",
    },
    {
      label: "Total Working",
      value: formatWorkingTime(attendance?.totalMinutes || 0),
      icon: "⏱️",
    },
  ];

  return (
    <section style={cardStyle}>
      {/* HEADER */}

      <div style={headerStyle}>
        <div>
          <span className="dashboard-card-label">
            ATTENDANCE
          </span>

          <h2
            style={{
              margin: "6px 0",
              fontSize: "24px",
              color: "#172033",
            }}
          >
            Today's Attendance
          </h2>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Track your working time for today.
          </p>
        </div>

        <span style={iconStyle}>🕐</span>
      </div>

      {/* ATTENDANCE DETAILS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))",
          gap: "14px",
        }}
      >
        {attendanceStats.map((item) => (
          <div
            key={item.label}
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              minWidth: 0,
            }}
          >
            <span
              style={{
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              {item.icon} {item.label}
            </span>

            <strong
              style={{
                color: "#172033",
                fontSize: "20px",
                overflowWrap: "anywhere",
              }}
            >
              {item.value}
            </strong>
          </div>
        ))}
      </div>

      {/* ACTION BUTTONS */}

      <div style={{ marginTop: "18px" }}>
        {!attendance?.checkIn ? (
          <button
            className="attendance-check-in"
            onClick={handleCheckIn}
            disabled={actionLoading}
          >
            {actionLoading ? "Checking..." : "🟢 Check In"}
          </button>
        ) : !attendance?.checkOut ? (
          <button
            className="attendance-check-out"
            onClick={handleCheckOut}
            disabled={actionLoading}
          >
            {actionLoading ? "Checking..." : "🔴 Check Out"}
          </button>
        ) : (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#dcfce7",
              color: "#166534",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            ✓ Today's attendance completed
          </div>
        )}
      </div>

      {/* STATUS MESSAGE */}

      {message && (
        <p
          role="status"
          style={{
            margin: "14px 0 0",
            color: "#475569",
            fontSize: "14px",
          }}
        >
          {message}
        </p>
      )}
    </section>
  );
}

export default AttendanceCard;
