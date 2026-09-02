import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {

  const navigate = useNavigate();

  const {
    user,
    register,
    verifyRegistrationOTP,
    sendLoginOTP,
    verifyLoginOTP,
    adminLogin,
  } = useAuth();


  // ==========================================
  // MODE
  // ==========================================

  const [isRegister, setIsRegister] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);

  const [otpSent, setOtpSent] = useState(false);


  // ==========================================
  // FORM DATA
  // ==========================================

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState("");


  // ==========================================
  // MESSAGES
  // ==========================================

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);


  // ==========================================
  // PROFILE PHOTO
  // ==========================================

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


  // ==========================================
  // SEND OTP
  // ==========================================

  const handleSendOTP = async () => {

    setError("");
    setSuccess("");


    if (!email.trim()) {

      setError(
        "Please enter your email."
      );

      return;

    }


    if (isRegister && !name.trim()) {

      setError(
        "Please enter your name."
      );

      return;

    }


    setLoading(true);


    let result;


    // ------------------------------------------
    // REGISTER
    // ------------------------------------------

    if (isRegister) {

      result = await register(
        name,
        email,
        profilePhoto
      );

    }

    // ------------------------------------------
    // EMPLOYEE LOGIN
    // ------------------------------------------

    else {

      result = await sendLoginOTP(
        email
      );

    }


    setLoading(false);


    if (!result.success) {

      setError(result.message);

      return;

    }


    setOtpSent(true);

    setSuccess(
      result.message ||
      "OTP sent successfully."
    );

  };


  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerifyOTP = async () => {

    setError("");
    setSuccess("");


    if (!otp.trim()) {

      setError(
        "Please enter the OTP."
      );

      return;

    }


    if (otp.length !== 6) {

      setError(
        "OTP must contain 6 digits."
      );

      return;

    }


    setLoading(true);


    let result;


    // ------------------------------------------
    // REGISTRATION OTP
    // ------------------------------------------

    if (isRegister) {

      result =
        await verifyRegistrationOTP(
          email,
          otp
        );

    }

    // ------------------------------------------
    // LOGIN OTP
    // ------------------------------------------

    else {

      result =
        await verifyLoginOTP(
          email,
          otp
        );

    }


    setLoading(false);


    if (!result.success) {

      setError(result.message);

      return;

    }


    setSuccess(
      result.message ||
      "Authentication successful."
    );


    // ------------------------------------------
    // REDIRECT
    // ------------------------------------------

    if (
      result.user.role === "admin"
    ) {

      navigate(
        "/admin-dashboard"
      );

    } else {

      navigate(
        "/dashboard"
      );

    }

  };


  // ==========================================
  // ADMIN LOGIN
  // ==========================================

  const handleAdminLogin = async (
    e
  ) => {

    e.preventDefault();

    setError("");
    setSuccess("");


    if (!email.trim()) {

      setError(
        "Please enter admin email."
      );

      return;

    }


    if (!password) {

      setError(
        "Please enter admin password."
      );

      return;

    }


    setLoading(true);


    const result =
      await adminLogin(
        email,
        password
      );


    setLoading(false);


    if (!result.success) {

      setError(result.message);

      return;

    }


    if (
      result.user.role !== "admin"
    ) {

      setError(
        "This account is not an admin account."
      );

      return;

    }


    navigate(
      "/admin-dashboard"
    );

  };


  // ==========================================
  // SWITCH LOGIN / REGISTER
  // ==========================================

  const switchMode = () => {

    setIsRegister(!isRegister);

    setOtpSent(false);

    setError("");

    setSuccess("");

    setName("");

    setEmail("");

    setOtp("");

    setProfilePhoto("");

  };


  // ==========================================
  // SWITCH EMPLOYEE / ADMIN
  // ==========================================

  const switchAdminMode = () => {

    setIsAdmin(!isAdmin);

    setIsRegister(false);

    setOtpSent(false);

    setError("");

    setSuccess("");

    setName("");

    setEmail("");

    setOtp("");

    setPassword("");

    setProfilePhoto("");

  };


  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="auth-page">


      {/* ======================================
          BACKGROUND
      ====================================== */}

      <div className="auth-shape shape-one"></div>

      <div className="auth-shape shape-two"></div>

      <div className="auth-shape shape-three"></div>


      {/* ======================================
          BRANDING
      ====================================== */}

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


      {/* ======================================
          AUTH CONTAINER
      ====================================== */}

      <div className="auth-container">

        <div
          className={
            isRegister
              ? "auth-card register-mode"
              : "auth-card"
          }
        >


          {/* ==================================
              HEADER
          ================================== */}

          <div className="auth-header">

            <div className="mobile-logo">
              ITT
            </div>


            <h2>

              {isAdmin
                ? "Admin Login 👑"
                : isRegister
                ? "Create Account 🚀"
                : "Welcome Back 👋"}

            </h2>


            <p>

              {isAdmin
                ? "Login to the admin dashboard."
                : isRegister
                ? "Create your employee account using OTP."
                : "Login using your email OTP."}

            </p>

          </div>


          {/* ==================================
              ERROR
          ================================== */}

          {error && (

            <div className="auth-error">
              ❌ {error}
            </div>

          )}


          {/* ==================================
              SUCCESS
          ================================== */}

          {success && (

            <div className="auth-success">
              ✅ {success}
            </div>

          )}


          {/* ==================================
              ADMIN LOGIN
          ================================== */}

          {isAdmin ? (

            <form
              className="auth-form"
              onSubmit={
                handleAdminLogin
              }
            >


              {/* EMAIL */}

              <div className="auth-input-group">

                <label>
                  Admin Email Address
                </label>

                <div className="auth-input-wrapper">

                  <span>
                    📧
                  </span>

                  <input
                    type="email"
                    placeholder="Enter admin email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div className="auth-input-group">

                <label>
                  Admin Password
                </label>

                <div className="auth-input-wrapper">

                  <span>
                    🔒
                  </span>

                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>

                </div>

              </div>


              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >

                {loading
                  ? "Logging in..."
                  : "Admin Login 👑"}

              </button>


            </form>

          ) : (

            /* =================================
               EMPLOYEE AUTH
            ================================= */

            <form
              className="auth-form"
              onSubmit={(e) => {

                e.preventDefault();

                if (otpSent) {

                  handleVerifyOTP();

                } else {

                  handleSendOTP();

                }

              }}
            >


              {/* NAME */}

              {isRegister && (

                <div className="auth-input-group">

                  <label>
                    Full Name
                  </label>

                  <div className="auth-input-wrapper">

                    <span>
                      👤
                    </span>

                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) =>
                        setName(
                          e.target.value
                        )
                      }
                      required
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

                  <span>
                    📧
                  </span>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    disabled={otpSent}
                    required
                  />

                </div>

              </div>


              {/* PROFILE PHOTO */}

              {isRegister && !otpSent && (

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
                        onChange={
                          handlePhotoChange
                        }
                      />

                    </label>

                  </div>

                </div>

              )}


              {/* OTP */}

              {otpSent && (

                <div className="auth-input-group">

                  <label>
                    Enter OTP
                  </label>

                  <div className="auth-input-wrapper">

                    <span>
                      🔐
                    </span>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="6"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) =>
                        setOtp(
                          e.target.value
                            .replace(
                              /\D/g,
                              ""
                            )
                        )
                      }
                      required
                    />

                  </div>

                </div>

              )}


              {/* SUBMIT */}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >

                {loading

                  ? "Please wait..."

                  : otpSent

                  ? isRegister
                    ? "Verify & Create Account 🚀"
                    : "Verify & Login →"

                  : isRegister
                  ? "Send OTP 📧"
                  : "Send Login OTP 📧"

                }

              </button>


              {/* BACK */}

              {otpSent && (

                <button
                  type="button"
                  className="auth-secondary-button"
                  onClick={() => {

                    setOtpSent(false);

                    setOtp("");

                    setError("");

                    setSuccess("");

                  }}
                >

                  ← Change Email

                </button>

              )}


            </form>

          )}


          {/* ==================================
              SWITCHES
          ================================== */}

          <div className="auth-switch">

            {isAdmin ? (

              <>
                Employee login?

                <button
                  type="button"
                  onClick={
                    switchAdminMode
                  }
                >
                  Login with OTP
                </button>
              </>

            ) : (

              <>

                {isRegister
                  ? "Already have an account?"
                  : "Don't have an account?"}

                <button
                  type="button"
                  onClick={
                    switchMode
                  }
                >

                  {isRegister
                    ? "Login"
                    : "Register"}

                </button>

              </>

            )}

          </div>


          {/* ==================================
              ADMIN LINK
          ================================== */}

          {!isAdmin && (

            <div
              className="auth-switch"
              style={{
                marginTop: "10px"
              }}
            >

              Admin?

              <button
                type="button"
                onClick={
                  switchAdminMode
                }
              >
                Admin Login
              </button>

            </div>

          )}

        </div>

      </div>

    </div>

  );

}

export default Login;