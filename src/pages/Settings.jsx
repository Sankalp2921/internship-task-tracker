import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Settings() {

  const navigate = useNavigate();

  const {
    user,
    updateUser,
    logout
  } = useAuth();


  /* =========================
     PROFILE
  ========================= */

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profilePhoto, setProfilePhoto] = useState(
    user?.profilePhoto || ""
  );


  /* =========================
     NOTIFICATIONS
  ========================= */

  const [notifications, setNotifications] = useState(() => {

    const saved = localStorage.getItem("notifications");

    return saved
      ? JSON.parse(saved)
      : {
          taskAssigned: true,
          deadlineReminder: true,
          taskCompleted: true,
          emailNotifications: false
        };
  });


  /* =========================
     APPEARANCE
  ========================= */

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });


  /* =========================
     TASK PREFERENCES
  ========================= */

  const [sortBy, setSortBy] = useState(() => {
    return localStorage.getItem("sortBy") || "recent";
  });

  const [defaultPriority, setDefaultPriority] = useState(() => {
    return localStorage.getItem("defaultPriority") || "Medium";
  });


  /* =========================
     PASSWORD
  ========================= */

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");


  /* =========================
     PROFILE PHOTO
  ========================= */

  const handlePhotoChange = (e) => {

    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfilePhoto(reader.result);
    };

    reader.readAsDataURL(file);
  };


  /* =========================
     SAVE PROFILE
  ========================= */

  const handleProfileSave = (e) => {

    e.preventDefault();

    updateUser({
      name,
      email,
      profilePhoto
    });

    setMessage("Profile updated successfully.");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };


  /* =========================
     NOTIFICATION CHANGE
  ========================= */

  const handleNotificationChange = (key) => {

    const updated = {
      ...notifications,
      [key]: !notifications[key]
    };

    setNotifications(updated);

    localStorage.setItem(
      "notifications",
      JSON.stringify(updated)
    );
  };


  /* =========================
     THEME
  ========================= */

  useEffect(() => {

    localStorage.setItem(
      "theme",
      theme
    );

    if (theme === "dark") {
      document.body.classList.add("dark-mode");
    } else if (theme === "light") {
      document.body.classList.remove("dark-mode");
    } else {

      const prefersDark =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;

      if (prefersDark) {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }
    }

  }, [theme]);


  /* =========================
     TASK PREFERENCES
  ========================= */

  const handleSortChange = (value) => {

    setSortBy(value);

    localStorage.setItem(
      "sortBy",
      value
    );
  };


  const handlePriorityChange = (value) => {

    setDefaultPriority(value);

    localStorage.setItem(
      "defaultPriority",
      value
    );
  };


  /* =========================
     CHANGE PASSWORD
  ========================= */

  const handlePasswordChange = (e) => {

    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {

      setMessage(
        "Please fill all password fields."
      );

      return;
    }

    if (currentPassword !== user?.password) {

      setMessage(
        "Current password is incorrect."
      );

      return;
    }

    if (newPassword !== confirmPassword) {

      setMessage(
        "New passwords do not match."
      );

      return;
    }

    updateUser({
      password: newPassword
    });

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setMessage(
      "Password changed successfully."
    );

  };


  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {

    logout();

    navigate("/");
  };


  return (
    <main className="page settings-page">

      <div className="page-heading">

        <h1>⚙️ Settings</h1>

        <p>
          Manage your profile, preferences and account.
        </p>

      </div>


      {message && (
        <div className="settings-message">
          {message}
        </div>
      )}


      {/* =========================
          PROFILE
      ========================= */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div>
            <h2>👤 Profile</h2>

            <p>
              Manage your personal information.
            </p>
          </div>

        </div>


        <form
          className="settings-form"
          onSubmit={handleProfileSave}
        >

          <div className="settings-profile">

            {profilePhoto ? (

              <img
                src={profilePhoto}
                alt="Profile"
                className="settings-profile-image"
              />

            ) : (

              <div className="settings-profile-placeholder">
                👤
              </div>

            )}

            <label className="photo-button">

              Change Photo

              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />

            </label>

          </div>


          <div className="form-group">

            <label>Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

          </div>


          <div className="form-group">

            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>


          <button
            type="submit"
            className="primary-button"
          >
            Save Profile
          </button>

        </form>

      </section>


      {/* =========================
          NOTIFICATIONS
      ========================= */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div>

            <h2>🔔 Notifications</h2>

            <p>
              Choose which notifications you want.
            </p>

          </div>

        </div>


        <div className="settings-options">

          <label className="setting-option">

            <div>
              <strong>Task Assigned</strong>

              <span>
                Notify when a new task is assigned.
              </span>
            </div>

            <input
              type="checkbox"
              checked={notifications.taskAssigned}
              onChange={() =>
                handleNotificationChange(
                  "taskAssigned"
                )
              }
            />

          </label>


          <label className="setting-option">

            <div>
              <strong>Deadline Reminder</strong>

              <span>
                Remind me about upcoming deadlines.
              </span>
            </div>

            <input
              type="checkbox"
              checked={notifications.deadlineReminder}
              onChange={() =>
                handleNotificationChange(
                  "deadlineReminder"
                )
              }
            />

          </label>


          <label className="setting-option">

            <div>
              <strong>Task Completed</strong>

              <span>
                Notify when a task is completed.
              </span>
            </div>

            <input
              type="checkbox"
              checked={notifications.taskCompleted}
              onChange={() =>
                handleNotificationChange(
                  "taskCompleted"
                )
              }
            />

          </label>


          <label className="setting-option">

            <div>
              <strong>Email Notifications</strong>

              <span>
                Receive notifications through email.
              </span>
            </div>

            <input
              type="checkbox"
              checked={notifications.emailNotifications}
              onChange={() =>
                handleNotificationChange(
                  "emailNotifications"
                )
              }
            />

          </label>

        </div>

      </section>


      {/* =========================
          APPEARANCE
      ========================= */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div>

            <h2>🎨 Appearance</h2>

            <p>
              Customize the look of your dashboard.
            </p>

          </div>

        </div>


        <div className="theme-options">

          <button
            className={
              theme === "light"
                ? "theme-button active"
                : "theme-button"
            }
            onClick={() => setTheme("light")}
          >
            ☀️ Light
          </button>


          <button
            className={
              theme === "dark"
                ? "theme-button active"
                : "theme-button"
            }
            onClick={() => setTheme("dark")}
          >
            🌙 Dark
          </button>


          <button
            className={
              theme === "system"
                ? "theme-button active"
                : "theme-button"
            }
            onClick={() => setTheme("system")}
          >
            💻 System
          </button>

        </div>

      </section>


      {/* =========================
          SECURITY
      ========================= */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div>

            <h2>🔐 Security</h2>

            <p>
              Manage your account security.
            </p>

          </div>

        </div>


        <form
          className="settings-form"
          onSubmit={handlePasswordChange}
        >

          <div className="form-group">

            <label>
              Current Password
            </label>

            <input
              type="password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(e.target.value)
              }
              placeholder="Enter current password"
            />

          </div>


          <div className="form-group">

            <label>
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              placeholder="Enter new password"
            />

          </div>


          <div className="form-group">

            <label>
              Confirm New Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm new password"
            />

          </div>


          <button
            type="submit"
            className="primary-button"
          >
            Change Password
          </button>

        </form>


        <button
          className="danger-button"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </section>


      {/* =========================
          TASK PREFERENCES
      ========================= */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div>

            <h2>📊 Task Preferences</h2>

            <p>
              Customize how your tasks are managed.
            </p>

          </div>

        </div>


        <div className="form-group">

          <label>
            Sort Tasks By
          </label>

          <select
            value={sortBy}
            onChange={(e) =>
              handleSortChange(e.target.value)
            }
          >

            <option value="recent">
              Recently Added
            </option>

            <option value="deadline">
              Deadline
            </option>

            <option value="priority">
              Priority
            </option>

            <option value="status">
              Status
            </option>

          </select>

        </div>


        <div className="form-group">

          <label>
            Default Priority
          </label>

          <select
            value={defaultPriority}
            onChange={(e) =>
              handlePriorityChange(e.target.value)
            }
          >

            <option value="Low">
              Low
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="High">
              High
            </option>

          </select>

        </div>

      </section>


      {/* =========================
          ABOUT
      ========================= */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div>

            <h2>ℹ️ About</h2>

            <p>
              Information about this application.
            </p>

          </div>

        </div>


        <div className="about-content">

          <h3>
            Internship Task Tracker
          </h3>

          <p>
            Version: 1.0.0
          </p>

          <p>
            A task management dashboard designed
            for internship work tracking.
          </p>


          <div className="technology-list">

            <span>React.js</span>
            <span>React Router</span>
            <span>Context API</span>
            <span>Vite</span>
            <span>CSS</span>

          </div>

          <p className="copyright">
            © 2026 Internship Task Tracker
          </p>

        </div>

      </section>

    </main>
  );
}

export default Settings;