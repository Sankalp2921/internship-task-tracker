import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isAdmin = user?.role === "admin";

  return (
    <aside
      className={`sidebar ${collapsed ? "collapsed" : ""}`}
    >
      {/* LOGO + TOGGLE */}
      <div className="sidebar-header">
        <h2 className="sidebar-logo">ITT</h2>

        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Open Sidebar" : "Close Sidebar"}
        >
          {collapsed ? "☰" : "✕"}
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="sidebar-nav">
        {isAdmin ? (
          /* ADMIN NAVIGATION */
          <>
            <NavLink to="/admin-dashboard">
              <span className="nav-icon">🏠</span>
              <span className="nav-text">Admin Dashboard</span>
            </NavLink>

            <NavLink to="/admin-tasks">
              <span className="nav-icon">📋</span>
              <span className="nav-text">All Tasks</span>
            </NavLink>

            <NavLink to="/add-task">
              <span className="nav-icon">➕</span>
              <span className="nav-text">Add Task</span>
            </NavLink>

            <NavLink to="/attendance">
              <span className="nav-icon">🕐</span>
              <span className="nav-text">Attendance</span>
            </NavLink>
            <NavLink to="/employee-attendance">
              <span className="nav-icon">👥</span>
              <span className="nav-text">Employee Attendance</span>
            </NavLink>
            {/* ADMIN LEAVE MANAGEMENT */}
            <NavLink to="/admin-leaves">
              <span className="nav-icon">📅</span>
              <span className="nav-text">Leave Management</span>
            </NavLink>
          </>
        ) : (
          /* EMPLOYEE NAVIGATION */
          <>
            <NavLink to="/dashboard">
              <span className="nav-icon">🏠</span>
              <span className="nav-text">Dashboard</span>
            </NavLink>

            <NavLink to="/tasks">
              <span className="nav-icon">📋</span>
              <span className="nav-text">My Tasks</span>
            </NavLink>

            <NavLink to="/completed">
              <span className="nav-icon">✅</span>
              <span className="nav-text">Completed</span>
            </NavLink>

            <NavLink to="/attendance">
              <span className="nav-icon">🕐</span>
              <span className="nav-text">Attendance</span>
            </NavLink>

            {/* EMPLOYEE LEAVE REQUESTS */}
            <NavLink to="/leave">
              <span className="nav-icon">📝</span>
              <span className="nav-text">Leave Requests</span>
            </NavLink>
          </>
        )}

        {/* SETTINGS - BOTH ROLES */}
        <NavLink to="/settings">
          <span className="nav-icon">⚙️</span>
          <span className="nav-text">Settings</span>
        </NavLink>
      </nav>

      {/* LOGOUT */}
      <button
        className="logout"
        onClick={handleLogout}
        title="Logout"
      >
        <span className="nav-icon">🚪</span>
        <span className="nav-text">Logout</span>
      </button>
    </aside>
  );
}

export default Sidebar;