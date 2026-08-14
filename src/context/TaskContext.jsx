import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

const TaskContext = createContext();

export function TaskProvider({ children }) {

  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);


  // ==========================================
  // LOAD TASKS FOR CURRENT USER
  // ==========================================

  useEffect(() => {

    // If nobody is logged in
    if (!user) {
      setTasks([]);
      return;
    }

    // Create unique storage key for user
    const storageKey = `tasks_${user.email}`;

    const savedTasks = localStorage.getItem(storageKey);

    if (savedTasks) {

      setTasks(JSON.parse(savedTasks));

    } else {

      // New user starts with zero tasks
      setTasks([]);

    }

  }, [user]);


  // ==========================================
  // ADD TASK
  // ==========================================

  const addTask = (task) => {

    if (!user) {
      return;
    }

    const newTask = {
      ...task,
      id: Date.now(),
    };

    setTasks((prevTasks) => {

      const updatedTasks = [
        ...prevTasks,
        newTask,
      ];

      const storageKey = `tasks_${user.email}`;

      localStorage.setItem(
        storageKey,
        JSON.stringify(updatedTasks)
      );

      return updatedTasks;

    });

  };


  // ==========================================
  // DELETE TASK
  // ==========================================

  const deleteTask = (id) => {

    if (!user) {
      return;
    }

    setTasks((prevTasks) => {

      const updatedTasks = prevTasks.filter(
        (task) => task.id !== id
      );

      const storageKey = `tasks_${user.email}`;

      localStorage.setItem(
        storageKey,
        JSON.stringify(updatedTasks)
      );

      return updatedTasks;

    });

  };


  // ==========================================
  // UPDATE TASK
  // ==========================================

  const updateTask = (id, updatedTask) => {

    if (!user) {
      return;
    }

    setTasks((prevTasks) => {

      const updatedTasks = prevTasks.map(
        (task) =>
          task.id === id
            ? {
                ...task,
                ...updatedTask,
              }
            : task
      );

      const storageKey = `tasks_${user.email}`;

      localStorage.setItem(
        storageKey,
        JSON.stringify(updatedTasks)
      );

      return updatedTasks;

    });

  };


  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        deleteTask,
        updateTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}


export function useTasks() {
  return useContext(TaskContext);
}