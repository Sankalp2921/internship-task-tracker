import React from "react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user } = useAuth();

  return (
    <header className="navbar">

      <h2>
        Internship Task Tracker
      </h2>

      <div className="profile">

        {user?.profilePhoto ? (
          <img
            src={user.profilePhoto}
            alt="Profile"
            className="profile-image"
          />
        ) : (
          <div className="profile-placeholder">
            👤
          </div>
        )}

        <span>
          {user ? user.name : "User"}
        </span>

      </div>

    </header>
  );
}

export default Navbar;