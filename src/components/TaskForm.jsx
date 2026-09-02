import React, { useState } from "react";

function TaskForm({ onAdd, employees = [] }) {

  // ==========================================
  // GET DEFAULT PRIORITY
  // ==========================================

  const savedPriority =
    localStorage.getItem("defaultPriority") || "Medium";

  const defaultPriority =
    savedPriority.toLowerCase();


  // ==========================================
  // TASK STATE
  // ==========================================

  const [task, setTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: defaultPriority,
    deadline: "",
  });


  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {

    setTask({
      ...task,
      [e.target.name]: e.target.value,
    });

  };


  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    if (
      !task.title.trim() ||
      !task.description.trim() ||
      !task.assignedTo ||
      !task.deadline
    ) {

      alert(
        "Please enter title, description, employee and deadline."
      );

      return;

    }


    await onAdd({
      title: task.title.trim(),
      description: task.description.trim(),
      assignedTo: task.assignedTo,
      priority: task.priority,
      deadline: task.deadline,
    });


    // ==========================================
    // RESET FORM
    // ==========================================

    const currentDefaultPriority =
      (
        localStorage.getItem("defaultPriority") ||
        "Medium"
      ).toLowerCase();


    setTask({
      title: "",
      description: "",
      assignedTo: "",
      priority: currentDefaultPriority,
      deadline: "",
    });

  };


  return (
    <form
      className="task-form"
      onSubmit={handleSubmit}
    >


      {/* =========================
          TITLE
      ========================= */}

      <input
        type="text"
        name="title"
        placeholder="Task title"
        value={task.title}
        onChange={handleChange}
      />


      {/* =========================
          DESCRIPTION
      ========================= */}

      <textarea
        name="description"
        placeholder="Task description"
        value={task.description}
        onChange={handleChange}
      />


      {/* =========================
          ASSIGN EMPLOYEE
      ========================= */}

      <select
        name="assignedTo"
        value={task.assignedTo}
        onChange={handleChange}
      >

        <option value="">
          Select Employee
        </option>

        {employees.map((employee) => (

          <option
            key={employee._id}
            value={employee._id}
          >
            {employee.name} ({employee.email})
          </option>

        ))}

      </select>


      {/* =========================
          PRIORITY
      ========================= */}

      <select
        name="priority"
        value={task.priority}
        onChange={handleChange}
      >

        <option value="low">
          Low
        </option>

        <option value="medium">
          Medium
        </option>

        <option value="high">
          High
        </option>

      </select>


      {/* =========================
          DEADLINE
      ========================= */}

      <input
        type="date"
        name="deadline"
        value={task.deadline}
        onChange={handleChange}
      />


      {/* =========================
          SUBMIT
      ========================= */}

      <button type="submit">
        Add Task
      </button>

    </form>
  );
}

export default TaskForm;