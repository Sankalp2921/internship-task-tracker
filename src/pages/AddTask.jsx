import React from "react";
import { useNavigate } from "react-router-dom";
import TaskForm from "../components/TaskForm";
import { useTasks } from "../context/TaskContext";

function AddTask() {
  const navigate = useNavigate();

  const { addTask } = useTasks();

  const handleAdd = (task) => {
    addTask(task);

    // Go to My Tasks after adding
    navigate("/tasks");
  };

  return (
    <main className="page">

      <div className="page-heading">
        <h1>Add New Task</h1>

        <p>
          Create a new internship task.
        </p>
      </div>

      <TaskForm onAdd={handleAdd} />

    </main>
  );
}

export default AddTask;