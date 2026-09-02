import React, {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext();

// ==========================================
// API URL
// ==========================================

// Local development:
// http://localhost:5001
//
// Production:
// Vercel will use VITE_API_URL from environment variables.

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5001"
).replace(/\/$/, "");


// ==========================================
// GET CURRENT USER
// ==========================================

function getCurrentUser() {
  const savedUser = localStorage.getItem("currentUser");

  if (savedUser) {
    try {
      return JSON.parse(savedUser);
    } catch (error) {
      localStorage.removeItem("currentUser");
    }
  }

  return null;
}


// ==========================================
// SAVE LOGGED-IN USER
// ==========================================

function saveUser(userData) {
  localStorage.setItem(
    "currentUser",
    JSON.stringify(userData)
  );
}


// ==========================================
// AUTH PROVIDER
// ==========================================

export function AuthProvider({ children }) {

  const [user, setUser] = useState(getCurrentUser);


  // ==========================================
  // REGISTER EMPLOYEE
  // NAME + EMAIL → OTP
  // ==========================================

  const register = async (
    name,
    email,
    profilePhoto
  ) => {

    try {

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            profilePhoto,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        return {
          success: false,
          message:
            data.message ||
            "Registration failed.",
        };

      }


      return {
        success: true,
        message:
          data.message ||
          "OTP sent successfully.",

        email: data.email || email,
      };


    } catch (error) {

      console.error(
        "Registration error:",
        error
      );

      return {
        success: false,
        message:
          "Unable to connect to the server.",
      };

    }

  };


  // ==========================================
  // VERIFY REGISTRATION OTP
  // OTP → JWT → LOGIN
  // ==========================================

  const verifyRegistrationOTP = async (
    email,
    otp
  ) => {

    try {

      const response = await fetch(
        `${API_URL}/api/auth/verify-otp`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        return {
          success: false,
          message:
            data.message ||
            "OTP verification failed.",
        };

      }


      // --------------------------------
      // BACKEND RETURNED JWT + USER
      // --------------------------------

      const loggedInUser = {

        id: data.user.id,

        name: data.user.name,

        email: data.user.email,

        role: data.user.role,

        profilePhoto:
          data.user.profilePhoto || "",

        token: data.token,

      };


      // --------------------------------
      // SAVE USER
      // --------------------------------

      setUser(loggedInUser);

      saveUser(loggedInUser);


      return {

        success: true,

        message:
          data.message ||
          "Registration successful.",

        user: loggedInUser,

      };


    } catch (error) {

      console.error(
        "OTP verification error:",
        error
      );

      return {

        success: false,

        message:
          "Unable to connect to the server.",

      };

    }

  };


  // ==========================================
  // SEND LOGIN OTP
  // EXISTING EMPLOYEE
  // ==========================================

  const sendLoginOTP = async (
    email
  ) => {

    try {

      const response = await fetch(
        `${API_URL}/api/auth/send-login-otp`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        return {

          success: false,

          message:
            data.message ||
            "Unable to send login OTP.",

        };

      }


      return {

        success: true,

        message:
          data.message ||
          "Login OTP sent successfully.",

        email:
          data.email || email,

      };


    } catch (error) {

      console.error(
        "Send login OTP error:",
        error
      );

      return {

        success: false,

        message:
          "Unable to connect to the server.",

      };

    }

  };


  // ==========================================
  // VERIFY LOGIN OTP
  // OTP → JWT → LOGIN
  // ==========================================

  const verifyLoginOTP = async (
    email,
    otp
  ) => {

    try {

      const response = await fetch(
        `${API_URL}/api/auth/verify-login-otp`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        return {

          success: false,

          message:
            data.message ||
            "OTP verification failed.",

        };

      }


      // --------------------------------
      // CREATE FRONTEND USER OBJECT
      // --------------------------------

      const loggedInUser = {

        id: data.user.id,

        name: data.user.name,

        email: data.user.email,

        role: data.user.role,

        profilePhoto:
          data.user.profilePhoto || "",

        token: data.token,

      };


      // --------------------------------
      // SAVE USER
      // --------------------------------

      setUser(loggedInUser);

      saveUser(loggedInUser);


      return {

        success: true,

        message:
          data.message ||
          "Login successful.",

        user: loggedInUser,

      };


    } catch (error) {

      console.error(
        "Verify login OTP error:",
        error
      );

      return {

        success: false,

        message:
          "Unable to connect to the server.",

      };

    }

  };


  // ==========================================
  // ADMIN LOGIN
  // EMAIL + PASSWORD
  // ==========================================

  const adminLogin = async (
    email,
    password
  ) => {

    try {

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        return {

          success: false,

          message:
            data.message ||
            "Admin login failed.",

        };

      }


      const loggedInUser = {

        id: data.user.id,

        name: data.user.name,

        email: data.user.email,

        role: data.user.role,

        profilePhoto:
          data.user.profilePhoto || "",

        token: data.token,

      };


      setUser(loggedInUser);

      saveUser(loggedInUser);


      return {

        success: true,

        message:
          data.message ||
          "Login successful.",

        user: loggedInUser,

      };


    } catch (error) {

      console.error(
        "Admin login error:",
        error
      );

      return {

        success: false,

        message:
          "Unable to connect to the server.",

      };

    }

  };


  // ==========================================
  // UPDATE USER PROFILE
  // ==========================================

  const updateUser = async (
    updatedData
  ) => {

    if (!user || !user.token) {

      return {

        success: false,

        message:
          "You are not logged in.",

      };

    }


    try {

      const response = await fetch(
        `${API_URL}/api/auth/profile`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",

            "Authorization":
              `Bearer ${user.token}`,
          },

          body: JSON.stringify(
            updatedData
          ),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        return {

          success: false,

          message:
            data.message ||
            "Unable to update profile.",

        };

      }


      const updatedUser = {

        ...user,

        name:
          data.user.name,

        email:
          data.user.email,

        role:
          data.user.role,

        profilePhoto:
          data.user.profilePhoto || "",

      };


      setUser(updatedUser);

      saveUser(updatedUser);


      return {

        success: true,

        message:
          data.message ||
          "Profile updated successfully.",

        user: updatedUser,

      };


    } catch (error) {

      console.error(
        "Profile update error:",
        error
      );

      return {

        success: false,

        message:
          "Unable to connect to the server.",

      };

    }

  };


  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {

    setUser(null);

    localStorage.removeItem(
      "currentUser"
    );

  };


  // ==========================================
  // CONTEXT
  // ==========================================

  return (

    <AuthContext.Provider
      value={{

        user,

        register,

        verifyRegistrationOTP,

        sendLoginOTP,

        verifyLoginOTP,

        adminLogin,

        updateUser,

        logout,

      }}
    >

      {children}

    </AuthContext.Provider>

  );

}


// ==========================================
// USE AUTH
// ==========================================

export function useAuth() {

  return useContext(
    AuthContext
  );

}