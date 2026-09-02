import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

const TaskContext = createContext();

// ==========================================
// API URL
// ==========================================

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5001"
).replace(/\/$/, "");


export function TaskProvider({ children }) {

  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);


  // ==========================================
  // LOAD EMPLOYEE TASKS
  // ==========================================

  useEffect(() => {

    const loadTasks = async () => {

      if (!user || !user.token) {
        setTasks([]);
        setLoading(false);
        return;
      }


      // Admin does not use /my-tasks
      if (user.role === "admin") {
        setTasks([]);
        setLoading(false);
        return;
      }


      try {

        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/tasks/my-tasks`,
          {
            method: "GET",

            headers: {
              "Authorization": `Bearer ${user.token}`,
            },
          }
        );


        const data = await response.json();


        if (!response.ok) {

          console.error(
            "Fetch tasks failed:",
            data.message
          );

          setTasks([]);
          return;
        }


        const formattedTasks = data.tasks.map(
          (task) => ({
            id: task._id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            deadline: task.deadline,
            assignedTo: task.assignedTo,
            assignedBy: task.assignedBy,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,

            // Progress based on task status
            progress:
              task.status === "completed"
                ? 100
                : task.status === "in-progress"
                  ? 50
                  : 0,
          })
        );


        setTasks(formattedTasks);


      } catch (error) {

        console.error(
          "Load tasks error:",
          error
        );

        setTasks([]);


      } finally {

        setLoading(false);

      }

    };


    loadTasks();

  }, [user]);


  // ==========================================
  // ADD TASK - ADMIN
  // ==========================================

  const addTask = async (taskData) => {

    if (!user || !user.token) {

      return {
        success: false,
        message: "You are not logged in.",
      };

    }


    try {

      const response = await fetch(
        `${API_URL}/api/tasks`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}`,
          },

          body: JSON.stringify(taskData),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        return {
          success: false,
          message:
            data.message ||
            "Unable to create task.",
        };

      }


      // Add task to local React state

      const newTask = {
        id: data.task._id,
        title: data.task.title,
        description: data.task.description,
        status: data.task.status,
        priority: data.task.priority,
        deadline: data.task.deadline,
        assignedTo: data.task.assignedTo,
        assignedBy: data.task.assignedBy,
        createdAt: data.task.createdAt,
        updatedAt: data.task.updatedAt,
      };


      setTasks((previousTasks) => [
        ...previousTasks,
        newTask,
      ]);


      return {
        success: true,
        message: data.message,
        task: newTask,
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


  // ==========================================
  // UPDATE TASK STATUS
  // ==========================================

  const updateTaskStatus = async (
    taskId,
    status
  ) => {

    if (!user || !user.token) {

      return {
        success: false,
        message: "You are not logged in.",
      };

    }


    try {

      const response = await fetch(
        `${API_URL}/api/tasks/${taskId}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}`,
          },

          body: JSON.stringify({
            status,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        return {
          success: false,
          message:
            data.message ||
            "Unable to update task.",
        };

      }


      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: data.task.status,
              }
            : task
        )
      );


      return {
        success: true,
        message: data.message,
        task: data.task,
      };


    } catch (error) {

      console.error(
        "Update task error:",
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
  // PROVIDER
  // ==========================================

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        addTask,
        updateTaskStatus,
      }}
    >

      {children}

    </TaskContext.Provider>
  );

}


// ==========================================
// USE TASKS
// ==========================================

export function useTasks() {

  return useContext(TaskContext);

}