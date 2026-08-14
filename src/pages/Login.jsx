import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();

  const { user, login, register } = useAuth();

  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profilePhoto, setProfilePhoto] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // =========================
  // PROFILE PHOTO
  // =========================

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


  // =========================
  // FORM SUBMIT
  // =========================

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");


    // =========================
    // REGISTER
    // =========================

    if (isRegister) {

      if (!name.trim()) {
        setError("Please enter your name.");
        return;
      }

      if (!email.trim()) {
        setError("Please enter your email.");
        return;
      }

      if (password.length < 6) {
        setError(
          "Password must contain at least 6 characters."
        );
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const result = register(
        name,
        email,
        password,
        profilePhoto
      );

      if (!result.success) {
        setError(result.message);
        return;
      }

      setSuccess(
        "Account created successfully! Please login."
      );

      // Clear form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setProfilePhoto("");

      // Switch to login
      setTimeout(() => {
        setIsRegister(false);
        setSuccess("");
      }, 1200);

      return;
    }


    // =========================
    // LOGIN
    // =========================

    const result = login(
      email,
      password
    );

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate("/dashboard");
  };


  // =========================
  // SWITCH LOGIN / REGISTER
  // =========================

  const switchMode = () => {

    setIsRegister(!isRegister);

    setError("");
    setSuccess("");

    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setProfilePhoto("");
  };


  return (
    <div className="auth-page">


      {/* =========================
          ANIMATED BACKGROUND
      ========================= */}

      <div className="auth-shape shape-one"></div>

      <div className="auth-shape shape-two"></div>

      <div className="auth-shape shape-three"></div>


      {/* =========================
          LEFT BRANDING
      ========================= */}

      <div className="auth-brand">

        <div className="brand-content">

          <div className="brand-logo">
            ITT
          </div>

          <h1>
            Internship
            <br />
            Task Tracker
          </h1>

          <p>
            Organize your internship work,
            track your progress and stay
            productive.
          </p>


          <div className="brand-features">

            <div>
              <span>✓</span>
              Manage your tasks
            </div>

            <div>
              <span>✓</span>
              Track your progress
            </div>

            <div>
              <span>✓</span>
              Never miss a deadline
            </div>

          </div>

        </div>

      </div>


      {/* =========================
          AUTH CARD
      ========================= */}

      <div className="auth-container">

        <div
          className={
            isRegister
              ? "auth-card register-mode"
              : "auth-card"
          }
        >


          {/* Heading */}

          <div className="auth-header">

            <div className="mobile-logo">
              ITT
            </div>

            <h2>
              {isRegister
                ? "Create Account 🚀"
                : "Welcome Back 👋"}
            </h2>

            <p>
              {isRegister
                ? "Create your account to get started."
                : "Login to your internship dashboard."}
            </p>

          </div>


          {/* Error */}

          {error && (
            <div className="auth-error">
              ❌ {error}
            </div>
          )}


          {/* Success */}

          {success && (
            <div className="auth-success">
              ✅ {success}
            </div>
          )}


          {/* FORM */}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >


            {/* NAME */}

            {isRegister && (

              <div className="auth-input-group">

                <label>
                  Full Name
                </label>

                <div className="auth-input-wrapper">

                  <span>👤</span>

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                  />

                </div>

              </div>

            )}


            {/* EMAIL */}

            <div className="auth-input-group">

              <label>
                Email Address
              </label>

              <div className="auth-input-wrapper">

                <span>📧</span>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="auth-input-group">

              <label>
                Password
              </label>

              <div className="auth-input-wrapper">

                <span>🔒</span>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

              </div>

            </div>


            {/* CONFIRM PASSWORD */}

            {isRegister && (

              <div className="auth-input-group">

                <label>
                  Confirm Password
                </label>

                <div className="auth-input-wrapper">

                  <span>🔐</span>

                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

            )}


            {/* PROFILE PHOTO */}

            {isRegister && (

              <div className="auth-input-group">

                <label>
                  Profile Photo
                </label>

                <div className="profile-upload-area">

                  {profilePhoto ? (

                    <img
                      src={profilePhoto}
                      alt="Profile preview"
                      className="register-photo-preview"
                    />

                  ) : (

                    <div className="register-photo-placeholder">
                      👤
                    </div>

                  )}

                  <label className="choose-photo-button">

                    📷 Choose Photo

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />

                  </label>

                </div>

              </div>

            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit"
            >

              {isRegister
                ? "Create Account 🚀"
                : "Login →"}

            </button>

          </form>


          {/* SWITCH */}

          <div className="auth-switch">

            {isRegister
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              type="button"
              onClick={switchMode}
            >

              {isRegister
                ? "Login"
                : "Register"}

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;