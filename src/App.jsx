import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import AddTask from "./pages/AddTask";
import TaskDetails from "./pages/TaskDetails";
import Settings from "./pages/Settings";

import { TaskProvider } from "./context/TaskContext";
import { AuthProvider } from "./context/AuthContext";

function Layout({ children }) {
  return (
    <div className="app-layout">

      <Sidebar />

      <div className="main-area">

        <Navbar />

        {children}

      </div>

    </div>
  );
}

function App() {
  return (
    <AuthProvider>

      <TaskProvider>

        <BrowserRouter>

          <Routes>

            {/* =========================
                LOGIN
            ========================= */}

            <Route
              path="/"
              element={<Login />}
            />


            {/* =========================
                DASHBOARD
            ========================= */}

            <Route
              path="/dashboard"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />


            {/* =========================
                MY TASKS
            ========================= */}

            <Route
              path="/tasks"
              element={
                <Layout>
                  <Tasks />
                </Layout>
              }
            />


            {/* =========================
                ADD TASK
            ========================= */}

            <Route
              path="/add-task"
              element={
                <Layout>
                  <AddTask />
                </Layout>
              }
            />


            {/* =========================
                TASK DETAILS
            ========================= */}

            <Route
              path="/tasks/:id"
              element={
                <Layout>
                  <TaskDetails />
                </Layout>
              }
            />


            {/* =========================
                COMPLETED TASKS
            ========================= */}

            <Route
              path="/completed"
              element={
                <Layout>
                  <Tasks />
                </Layout>
              }
            />


            {/* =========================
                SETTINGS
            ========================= */}

            <Route
              path="/settings"
              element={
                <Layout>
                  <Settings />
                </Layout>
              }
            />

          </Routes>

        </BrowserRouter>

      </TaskProvider>

    </AuthProvider>
  );
}

export default App;