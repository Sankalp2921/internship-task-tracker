import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminTasks from "./pages/AdminTasks";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
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
                ADMIN DASHBOARD
            ========================= */}

            <Route
              path="/admin-dashboard"
              element={

                <ProtectedRoute allowedRole="admin">

                  <Layout>

                    <AdminDashboard />

                  </Layout>

                </ProtectedRoute>

              }
            />


            {/* =========================
                ADMIN TASKS
            ========================= */}

            <Route
              path="/admin-tasks"
              element={

                <ProtectedRoute allowedRole="admin">

                  <Layout>

                    <AdminTasks />

                  </Layout>

                </ProtectedRoute>

              }
            />


            {/* =========================
                ADD TASK
                ADMIN ONLY
            ========================= */}

            <Route
              path="/add-task"
              element={

                <ProtectedRoute allowedRole="admin">

                  <Layout>

                    <AddTask />

                  </Layout>

                </ProtectedRoute>

              }
            />


            {/* =========================
                EMPLOYEE DASHBOARD
            ========================= */}

            <Route
              path="/dashboard"
              element={

                <ProtectedRoute allowedRole="employee">

                  <Layout>

                    <Dashboard />

                  </Layout>

                </ProtectedRoute>

              }
            />


            {/* =========================
                EMPLOYEE TASKS
            ========================= */}

            <Route
              path="/tasks"
              element={

                <ProtectedRoute allowedRole="employee">

                  <Layout>

                    <Tasks />

                  </Layout>

                </ProtectedRoute>

              }
            />


            {/* =========================
                TASK DETAILS
                EMPLOYEE ONLY
            ========================= */}

            <Route
              path="/tasks/:id"
              element={

                <ProtectedRoute allowedRole="employee">

                  <Layout>

                    <TaskDetails />

                  </Layout>

                </ProtectedRoute>

              }
            />


            {/* =========================
                COMPLETED TASKS
                EMPLOYEE ONLY
            ========================= */}

            <Route
              path="/completed"
              element={

                <ProtectedRoute allowedRole="employee">

                  <Layout>

                  <Tasks completedOnly={true} />

                  </Layout>

                </ProtectedRoute>

              }
            />


            {/* =========================
                SETTINGS
                BOTH ROLES
            ========================= */}

            <Route
              path="/settings"
              element={

                <ProtectedRoute>

                  <Layout>

                    <Settings />

                  </Layout>

                </ProtectedRoute>

              }
            />


          </Routes>

        </BrowserRouter>

      </TaskProvider>

    </AuthProvider>
  );
}


export default App;