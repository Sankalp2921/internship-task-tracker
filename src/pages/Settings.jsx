import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ==========================================
// API URL
// ==========================================

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5001"
).replace(/\/$/, "");


function Settings() {

  const navigate = useNavigate();

  const {
    user,
    updateUser,
    logout,
  } = useAuth();


  /* =========================
     PROFILE
  ========================= */

  const [name, setName] = useState(
    user?.name || ""
  );

  const [email, setEmail] = useState(
    user?.email || ""
  );

  const [profilePhoto, setProfilePhoto] = useState(
    user?.profilePhoto || ""
  );

  const [profileLoading, setProfileLoading] =
    useState(false);


  /* =========================
     NOTIFICATIONS
  ========================= */

  const [notifications, setNotifications] = useState(() => {

    const saved =
      localStorage.getItem("notifications");

    return saved
      ? JSON.parse(saved)
      : {
          taskAssigned: true,
          deadlineReminder: true,
          taskCompleted: true,
          emailNotifications: false,
        };

  });


  /* =========================
     APPEARANCE
  ========================= */

  const [theme, setTheme] = useState(() => {

    return (
      localStorage.getItem("theme") ||
      "system"
    );

  });


  /* =========================
     TASK PREFERENCES
  ========================= */

  const [sortBy, setSortBy] = useState(() => {

    return (
      localStorage.getItem("sortBy") ||
      "recent"
    );

  });


  const [defaultPriority, setDefaultPriority] =
    useState(() => {

      return (
        localStorage.getItem(
          "defaultPriority"
        ) || "Medium"
      );

    });


  /* =========================
     PASSWORD
     ADMIN ONLY
  ========================= */

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [passwordLoading, setPasswordLoading] =
    useState(false);


  /* =========================
     KEEP PROFILE IN SYNC
  ========================= */

  useEffect(() => {

    if (!user) {
      return;
    }

    setName(user.name || "");
    setEmail(user.email || "");
    setProfilePhoto(user.profilePhoto || "");

  }, [user]);


  /* =========================
     PROFILE PHOTO
  ========================= */

  const handlePhotoChange = (e) => {

    const file = e.target.files[0];

    if (!file) {
      return;
    }


    // Maximum 2 MB

    if (file.size > 2 * 1024 * 1024) {

      setMessage(
        "Profile photo must be smaller than 2 MB."
      );

      return;
    }


    const reader = new FileReader();

    reader.onloadend = () => {

      setProfilePhoto(
        reader.result
      );

    };

    reader.readAsDataURL(file);

  };


  /* =========================
     SAVE PROFILE
  ========================= */

  const handleProfileSave = async (e) => {

    e.preventDefault();

    setMessage("");


    // Check login

    if (!user || !user.token) {

      setMessage(
        "You are not logged in."
      );

      return;
    }


    // Validate name

    if (!name.trim()) {

      setMessage(
        "Name cannot be empty."
      );

      return;
    }


    // Validate email

    if (!email.trim()) {

      setMessage(
        "Email cannot be empty."
      );

      return;
    }


    try {

      setProfileLoading(true);


      const result = await updateUser({

        name: name.trim(),

        email: email.trim(),

        profilePhoto,

      });


      // Backend returned error

      if (!result.success) {

        setMessage(
          result.message ||
          "Unable to update profile."
        );

        return;
      }


      // Update form with backend response

      setName(
        result.user.name
      );

      setEmail(
        result.user.email
      );

      setProfilePhoto(
        result.user.profilePhoto || ""
      );


      setMessage(
        "Profile updated successfully."
      );


      setTimeout(() => {

        setMessage("");

      }, 3000);


    } catch (error) {

      console.error(
        "Profile save error:",
        error
      );

      setMessage(
        "Unable to update profile."
      );


    } finally {

      setProfileLoading(false);

    }

  };


  /* =========================
     NOTIFICATION CHANGE
  ========================= */

  const handleNotificationChange = (key) => {

    const updated = {

      ...notifications,

      [key]:
        !notifications[key],

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

      document.body.classList.add(
        "dark-mode"
      );

    }

    else if (theme === "light") {

      document.body.classList.remove(
        "dark-mode"
      );

    }

    else {

      const prefersDark =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;


      if (prefersDark) {

        document.body.classList.add(
          "dark-mode"
        );

      }

      else {

        document.body.classList.remove(
          "dark-mode"
        );

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
     ADMIN ONLY
  ========================= */

  const handlePasswordChange = async (e) => {

    e.preventDefault();

    setMessage("");


    /* -------------------------
       ADMIN CHECK
    ------------------------- */

    if (!user || user.role !== "admin") {

      setMessage(
        "Only admin can change the password."
      );

      return;
    }


    /* -------------------------
       VALIDATE FIELDS
    ------------------------- */

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {

      setMessage(
        "Please fill all password fields."
      );

      return;
    }


    /* -------------------------
       CHECK NEW PASSWORD
    ------------------------- */

    if (
      newPassword !==
      confirmPassword
    ) {

      setMessage(
        "New passwords do not match."
      );

      return;
    }


    /* -------------------------
       PASSWORD LENGTH
    ------------------------- */

    if (
      newPassword.length < 6
    ) {

      setMessage(
        "New password must be at least 6 characters."
      );

      return;
    }


    /* -------------------------
       CHECK LOGIN
    ------------------------- */

    if (!user.token) {

      setMessage(
        "You are not logged in."
      );

      return;
    }


    try {

      setPasswordLoading(true);


      /* -------------------------
         API REQUEST
      ------------------------- */

      const response = await fetch(

        `${API_URL}/api/auth/change-password`,

        {
          method: "PATCH",

          headers: {

            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${user.token}`,

          },

          body: JSON.stringify({

            currentPassword,

            newPassword,

          }),

        }

      );


      const data =
        await response.json();


      /* -------------------------
         API ERROR
      ------------------------- */

      if (!response.ok) {

        setMessage(

          data.message ||

          "Unable to change password."

        );

        return;
      }


      /* -------------------------
         SUCCESS
      ------------------------- */

      setCurrentPassword("");

      setNewPassword("");

      setConfirmPassword("");


      setMessage(
        "Password changed successfully."
      );


      setTimeout(() => {

        setMessage("");

      }, 3000);


    } catch (error) {

      console.error(
        "Change password error:",
        error
      );


      setMessage(
        "Unable to connect to the server."
      );


    } finally {

      setPasswordLoading(false);

    }

  };


  /* =========================
     LOGOUT
     AVAILABLE FOR BOTH
  ========================= */

  const handleLogout = () => {

    logout();

    navigate("/");

  };


  return (

    <main className="page settings-page">


      {/* =========================
          PAGE HEADING
      ========================= */}

      <div className="page-heading">

        <h1>
          ⚙️ Settings
        </h1>

        <p>
          Manage your profile, preferences and account.
        </p>

      </div>


      {/* =========================
          MESSAGE
      ========================= */}

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

            <h2>
              👤 Profile
            </h2>

            <p>
              Manage your personal information.
            </p>

          </div>

        </div>


        <form
          className="settings-form"
          onSubmit={handleProfileSave}
        >


          {/* PROFILE PHOTO */}

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


          {/* NAME */}

          <div className="form-group">

            <label>
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
            />

          </div>


          {/* EMAIL */}

          <div className="form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
            />

          </div>


          {/* SAVE PROFILE */}

          <button
            type="submit"
            className="primary-button"
            disabled={profileLoading}
          >

            {profileLoading
              ? "Saving Profile..."
              : "Save Profile"}

          </button>

        </form>

      </section>


      {/* =========================
          NOTIFICATIONS
      ========================= */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div>

            <h2>
              🔔 Notifications
            </h2>

            <p>
              Choose which notifications you want.
            </p>

          </div>

        </div>


        <div className="settings-options">


          {/* TASK ASSIGNED */}

          <label className="setting-option">

            <div>

              <strong>
                Task Assigned
              </strong>

              <span>
                Notify when a new task is assigned.
              </span>

            </div>

            <input
              type="checkbox"
              checked={
                notifications.taskAssigned
              }
              onChange={() =>
                handleNotificationChange(
                  "taskAssigned"
                )
              }
            />

          </label>


          {/* DEADLINE REMINDER */}

          <label className="setting-option">

            <div>

              <strong>
                Deadline Reminder
              </strong>

              <span>
                Remind me about upcoming deadlines.
              </span>

            </div>

            <input
              type="checkbox"
              checked={
                notifications.deadlineReminder
              }
              onChange={() =>
                handleNotificationChange(
                  "deadlineReminder"
                )
              }
            />

          </label>


          {/* TASK COMPLETED */}

          <label className="setting-option">

            <div>

              <strong>
                Task Completed
              </strong>

              <span>
                Notify when a task is completed.
              </span>

            </div>

            <input
              type="checkbox"
              checked={
                notifications.taskCompleted
              }
              onChange={() =>
                handleNotificationChange(
                  "taskCompleted"
                )
              }
            />

          </label>


          {/* EMAIL NOTIFICATIONS */}

          <label className="setting-option">

            <div>

              <strong>
                Email Notifications
              </strong>

              <span>
                Receive notifications through email.
              </span>

            </div>

            <input
              type="checkbox"
              checked={
                notifications.emailNotifications
              }
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

            <h2>
              🎨 Appearance
            </h2>

            <p>
              Customize the look of your dashboard.
            </p>

          </div>

        </div>


        <div className="theme-options">


          {/* LIGHT */}

          <button
            type="button"
            className={
              theme === "light"
                ? "theme-button active"
                : "theme-button"
            }
            onClick={() =>
              setTheme("light")
            }
          >
            ☀️ Light
          </button>


          {/* DARK */}

          <button
            type="button"
            className={
              theme === "dark"
                ? "theme-button active"
                : "theme-button"
            }
            onClick={() =>
              setTheme("dark")
            }
          >
            🌙 Dark
          </button>


          {/* SYSTEM */}

          <button
            type="button"
            className={
              theme === "system"
                ? "theme-button active"
                : "theme-button"
            }
            onClick={() =>
              setTheme("system")
            }
          >
            💻 System
          </button>

        </div>

      </section>


      {/* =========================
          SECURITY
          ADMIN ONLY
      ========================= */}

      {user?.role === "admin" && (

        <section className="settings-card">

          <div className="settings-card-header">

            <div>

              <h2>
                🔐 Security
              </h2>

              <p>
                Manage your account security.
              </p>

            </div>

          </div>


          <form
            className="settings-form"
            onSubmit={handlePasswordChange}
          >


            {/* CURRENT PASSWORD */}

            <div className="form-group">

              <label>
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
                placeholder="Enter current password"
              />

            </div>


            {/* NEW PASSWORD */}

            <div className="form-group">

              <label>
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                placeholder="Enter new password"
              />

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="form-group">

              <label>
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Confirm new password"
              />

            </div>


            {/* CHANGE PASSWORD */}

            <button
              type="submit"
              className="primary-button"
              disabled={passwordLoading}
            >

              {passwordLoading
                ? "Changing Password..."
                : "Change Password"}

            </button>

          </form>

        </section>

      )}


      {/* =========================
          LOGOUT
          BOTH ADMIN & EMPLOYEE
      ========================= */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div>

            <h2>
              🚪 Account
            </h2>

            <p>
              Manage your current session.
            </p>

          </div>

        </div>


        <button
          type="button"
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

            <h2>
              📊 Task Preferences
            </h2>

            <p>
              Customize how your tasks are managed.
            </p>

          </div>

        </div>


        {/* SORT TASKS */}

        <div className="form-group">

          <label>
            Sort Tasks By
          </label>

          <select
            value={sortBy}
            onChange={(e) =>
              handleSortChange(
                e.target.value
              )
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


        {/* DEFAULT PRIORITY */}

        <div className="form-group">

          <label>
            Default Priority
          </label>

          <select
            value={defaultPriority}
            onChange={(e) =>
              handlePriorityChange(
                e.target.value
              )
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

            <h2>
              ℹ️ About
            </h2>

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

            <span>
              React.js
            </span>

            <span>
              React Router
            </span>

            <span>
              Context API
            </span>

            <span>
              Vite
            </span>

            <span>
              CSS
            </span>

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