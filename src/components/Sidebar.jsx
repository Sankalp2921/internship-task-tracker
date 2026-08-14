import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* Logo + Toggle Button */}
      <div className="sidebar-header">

        <h2 className="sidebar-logo">
          ITT
        </h2>

        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Open Sidebar" : "Close Sidebar"}
        >
          {collapsed ? "☰" : "✕"}
        </button>

      </div>


      {/* Navigation */}
      <nav className="sidebar-nav">

        <NavLink to="/dashboard">
          <span className="nav-icon">🏠</span>
          <span className="nav-text">Dashboard</span>
        </NavLink>

        <NavLink to="/tasks">
          <span className="nav-icon">📋</span>
          <span className="nav-text">My Tasks</span>
        </NavLink>

        <NavLink to="/add-task">
          <span className="nav-icon">➕</span>
          <span className="nav-text">Add Task</span>
        </NavLink>

        <NavLink to="/completed">
          <span className="nav-icon">✅</span>
          <span className="nav-text">Completed</span>
        </NavLink>

        <NavLink to="/settings">
          <span className="nav-icon">⚙️</span>
          <span className="nav-text">Settings</span>
        </NavLink>

      </nav>


      {/* Logout */}
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