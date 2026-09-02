import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TaskForm from "../components/TaskForm";
import { useTasks } from "../context/TaskContext";
import { useAuth } from "../context/AuthContext";

function AddTask() {

  const navigate = useNavigate();

  const { addTask } = useTasks();
  const { user } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [error, setError] = useState("");


  // ==========================================
  // GET ALL EMPLOYEES
  // ==========================================

  useEffect(() => {

    const fetchEmployees = async () => {

      if (!user || !user.token) {
        setError("You are not logged in.");
        setLoadingEmployees(false);
        return;
      }

      try {

        const response = await fetch(
          "http://localhost:5001/api/admin/users",
          {
            method: "GET",

            headers: {
              "Authorization": `Bearer ${user.token}`,
            },
          }
        );


        const data = await response.json();


        if (!response.ok) {

          setError(
            data.message ||
            "Unable to fetch employees."
          );

          return;
        }


        setEmployees(data.users);

      } catch (error) {

        console.error(
          "Fetch employees error:",
          error
        );

        setError(
          "Unable to connect to the server."
        );

      } finally {

        setLoadingEmployees(false);

      }

    };


    fetchEmployees();

  }, [user]);


  // ==========================================
  // CREATE TASK
  // ==========================================

  const handleAdd = async (task) => {

    setError("");


    const result = await addTask(task);


    if (!result.success) {

      setError(result.message);
      return;

    }


    // Task successfully created

    navigate("/tasks");

  };


  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="page">

      <div className="page-heading">

        <h1>
          Add New Task
        </h1>

        <p>
          Create a new internship task.
        </p>

      </div>


      {error && (
        <div className="auth-error">
          ❌ {error}
        </div>
      )}


      {loadingEmployees ? (

        <p>
          Loading employees...
        </p>

      ) : (

        <TaskForm
          onAdd={handleAdd}
          employees={employees}
        />

      )}

    </main>
  );
}

export default AddTask;