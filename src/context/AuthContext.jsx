import React, {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext();


// ==========================================
// GET CURRENT USER
// ==========================================

function getCurrentUser() {

  const savedUser =
    localStorage.getItem("currentUser");

  if (savedUser) {
    return JSON.parse(savedUser);
  }

  return null;
}


// ==========================================
// GET REGISTERED USERS
// ==========================================

function getUsers() {

  const savedUsers =
    localStorage.getItem("registeredUsers");

  if (savedUsers) {
    return JSON.parse(savedUsers);
  }

  return [];
}


export function AuthProvider({ children }) {

  const [user, setUser] = useState(
    getCurrentUser
  );


  // ==========================================
  // REGISTER
  // ==========================================

  const register = (
    name,
    email,
    password,
    profilePhoto
  ) => {

    const users = getUsers();

    const existingUser = users.find(
      (existingUser) =>
        existingUser.email.toLowerCase() ===
        email.toLowerCase()
    );


    // Email already exists

    if (existingUser) {

      return {
        success: false,
        message:
          "An account with this email already exists.",
      };

    }


    const newUser = {

      id: Date.now(),

      name,

      email,

      password,

      profilePhoto:
        profilePhoto || "",

    };


    const updatedUsers = [
      ...users,
      newUser,
    ];


    localStorage.setItem(
      "registeredUsers",
      JSON.stringify(updatedUsers)
    );


    return {
      success: true,
      message: "Account created successfully.",
    };
  };


  // ==========================================
  // LOGIN
  // ==========================================

  const login = (
    email,
    password
  ) => {

    const users = getUsers();


    const foundUser = users.find(
      (existingUser) =>
        existingUser.email.toLowerCase() ===
          email.toLowerCase() &&
        existingUser.password ===
          password
    );


    if (!foundUser) {

      return {
        success: false,
        message:
          "Invalid email or password.",
      };

    }


    setUser(foundUser);


    localStorage.setItem(
      "currentUser",
      JSON.stringify(foundUser)
    );


    return {
      success: true,
      message: "Login successful.",
    };
  };


  // ==========================================
  // UPDATE USER
  // ==========================================

  const updateUser = (
    updatedData
  ) => {

    if (!user) {
      return;
    }


    const updatedUser = {
      ...user,
      ...updatedData,
    };


    setUser(updatedUser);


    // Current logged-in user

    localStorage.setItem(
      "currentUser",
      JSON.stringify(updatedUser)
    );


    // Registered users

    const users = getUsers();

    const updatedUsers = users.map(
      (existingUser) =>
        existingUser.email === user.email
          ? updatedUser
          : existingUser
    );


    localStorage.setItem(
      "registeredUsers",
      JSON.stringify(updatedUsers)
    );

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


  return (
    <AuthContext.Provider
      value={{
        user,
        register,
        login,
        updateUser,
        logout,
      }}
    >

      {children}

    </AuthContext.Provider>
  );
}


export function useAuth() {

  return useContext(
    AuthContext
  );

}