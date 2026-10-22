import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";


// ======================================
// CREATE CONTEXT
// ======================================

const TaskContext = createContext();


// ======================================
// API URL
// ======================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001"
).replace(/\/$/, "");


// ======================================
// PROVIDER
// ======================================

export const TaskProvider = ({ children }) => {

  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);


  // ======================================
  // FETCH EMPLOYEE TASKS
  // ======================================

  const fetchMyTasks = async () => {

    if (!user || !user.token) {
      setTasks([]);
      return;
    }

    if (user.role !== "employee") {
      return;
    }

    setLoading(true);

    try {

      const response = await fetch(
        `${API_URL}/api/tasks/my-tasks`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${user.token}`,
          },
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        console.error(
          "Fetch tasks error:",
          data.message
        );

        setTasks([]);

        return;
      }


      // Convert backend _id
      // into frontend id

      const formattedTasks =
        (data.tasks || []).map(
          (task) => ({
            ...task,

            id: task._id,

            submissions:
              task.submissions || [],
          })
        );


      setTasks(
        formattedTasks
      );

    } catch (error) {

      console.error(
        "Fetch tasks error:",
        error
      );

      setTasks([]);

    } finally {

      setLoading(false);
    }
  };


  // ======================================
  // FETCH TASKS WHEN USER CHANGES
  // ======================================

  useEffect(() => {

    if (
      user &&
      user.token &&
      user.role === "employee"
    ) {
      fetchMyTasks();
    } else {
      setTasks([]);
    }

  }, [user]);


  // ======================================
  // ADD TASK
  // ADMIN
  // ======================================

  const addTask = async (taskData) => {

    if (!user || !user.token) {

      return {
        success: false,
        message:
          "You are not logged in.",
      };
    }


    try {

      const response =
        await fetch(
          `${API_URL}/api/tasks`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${user.token}`,
            },

            body: JSON.stringify(
              taskData
            ),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        return {
          success: false,

          message:
            data.message ||
            "Unable to create task.",
        };
      }


      return {
        success: true,

        message:
          data.message,

        task:
          data.task,
      };

    } catch (error) {

      console.error(
        "Add task error:",
        error
      );

      return {
        success: false,

        message:
          "Unable to connect to the server.",
      };
    }
  };


  // ======================================
  // UPDATE TASK STATUS
  // EMPLOYEE
  // ======================================

  const updateTaskStatus = async (
    taskId,
    status
  ) => {

    if (!user || !user.token) {

      return {
        success: false,

        message:
          "You are not logged in.",
      };
    }


    try {

      const response =
        await fetch(
          `${API_URL}/api/tasks/${taskId}/status`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${user.token}`,
            },

            body: JSON.stringify({
              status,
            }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        return {
          success: false,

          message:
            data.message ||
            "Unable to update task status.",
        };
      }


      // Update task locally

      setTasks(
        (previousTasks) =>
          previousTasks.map(
            (task) =>
              task.id === taskId
                ? {
                    ...task,

                    status:
                      data.task.status,
                  }
                : task
          )
      );


      return {
        success: true,

        message:
          data.message,

        task:
          data.task,
      };

    } catch (error) {

      console.error(
        "Update task status error:",
        error
      );

      return {
        success: false,

        message:
          "Unable to connect to the server.",
      };
    }
  };


  // ======================================
  // UPLOAD TASK FILES
  // EMPLOYEE
  // ======================================

  const uploadTaskFiles = async (
    taskId,
    files
  ) => {

    if (!user || !user.token) {

      return {
        success: false,

        message:
          "You are not logged in.",
      };
    }


    if (!files || files.length === 0) {

      return {
        success: false,

        message:
          "Please select at least one file.",
      };
    }


    try {

      const formData =
        new FormData();


      Array.from(files).forEach(
        (file) => {

          formData.append(
            "files",
            file
          );

        }
      );


      const response =
        await fetch(
          `${API_URL}/api/tasks/${taskId}/submissions`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${user.token}`,
            },

            body: formData,
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        return {
          success: false,

          message:
            data.message ||
            "Unable to upload files.",
        };
      }


      // Update task locally

      setTasks(
        (previousTasks) =>
          previousTasks.map(
            (task) =>
              task.id === taskId
                ? {
                    ...task,

                    status:
                      data.task.status,

                    submissions:
                      data.task.submissions ||
                      [],
                  }
                : task
          )
      );


      return {

        success: true,

        message:
          data.message,

        submissions:
          data.submissions,

        task:
          data.task,
      };

    } catch (error) {

      console.error(
        "Upload task files error:",
        error
      );

      return {
        success: false,

        message:
          "Unable to connect to the server.",
      };
    }
  };


  // ======================================
  // DELETE TASK FILE
  // EMPLOYEE
  // ======================================

  const deleteTaskFile = async (
    taskId,
    submissionId
  ) => {

    if (!user || !user.token) {

      return {
        success: false,

        message:
          "You are not logged in.",
      };
    }


    try {

      const response =
        await fetch(
          `${API_URL}/api/tasks/${taskId}/submissions/${submissionId}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${user.token}`,
            },
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        return {
          success: false,

          message:
            data.message ||
            "Unable to delete file.",
        };
      }


      // Update task locally

      setTasks(
        (previousTasks) =>
          previousTasks.map(
            (task) =>
              task.id === taskId
                ? {
                    ...task,

                    status:
                      data.task.status,

                    submissions:
                      data.task.submissions ||
                      [],
                  }
                : task
          )
      );


      return {

        success: true,

        message:
          data.message,

        task:
          data.task,
      };

    } catch (error) {

      console.error(
        "Delete task file error:",
        error
      );

      return {
        success: false,

        message:
          "Unable to connect to the server.",
      };
    }
  };


  // ======================================
  // CONTEXT VALUE
  // ======================================

  const value = {

    tasks,

    loading,

    addTask,

    updateTaskStatus,

    uploadTaskFiles,

    deleteTaskFile,
  };


  return (
    <TaskContext.Provider
      value={value}
    >
      {children}
    </TaskContext.Provider>
  );
};


// ======================================
// CUSTOM HOOK
// ======================================

export const useTasks = () => {

  const context =
    useContext(TaskContext);


  if (!context) {

    throw new Error(
      "useTasks must be used within a TaskProvider"
    );
  }


  return context;
};