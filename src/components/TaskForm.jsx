import React, { useState } from "react";

function TaskForm({ onAdd }) {

  const [task, setTask] = useState({
    title: "",
    description: "",
    technology: "React.js",
    priority: "Medium",
    deadline: "",
    status: "Pending",
    progress: 0
  });

  const handleChange = (e) => {
    setTask({
      ...task,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!task.title || !task.deadline) {
      alert("Please enter task title and deadline.");
      return;
    }

    onAdd({
      ...task,
      id: Date.now(),
      progress: Number(task.progress)
    });

    // Clear form after adding task
    setTask({
      title: "",
      description: "",
      technology: "React.js",
      priority: "Medium",
      deadline: "",
      status: "Pending",
      progress: 0
    });
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>

      <input
        type="text"
        name="title"
        placeholder="Task title"
        value={task.title}
        onChange={handleChange}
      />

      <textarea
        name="description"
        placeholder="Task description"
        value={task.description}
        onChange={handleChange}
      />

      <select
        name="technology"
        value={task.technology}
        onChange={handleChange}
      >
        <option>React.js</option>
        <option>JavaScript</option>
        <option>Node.js</option>
        <option>MongoDB</option>
        <option>HTML/CSS</option>
      </select>

      <select
        name="priority"
        value={task.priority}
        onChange={handleChange}
      >
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>

      <input
        type="date"
        name="deadline"
        value={task.deadline}
        onChange={handleChange}
      />

      <select
        name="status"
        value={task.status}
        onChange={handleChange}
      >
        <option>Pending</option>
        <option>In Progress</option>
        <option>Completed</option>
      </select>

      <input
        type="number"
        name="progress"
        min="0"
        max="100"
        value={task.progress}
        onChange={handleChange}
        placeholder="Progress %"
      />

      <button type="submit">
        Add Task
      </button>

    </form>
  );
}

export default TaskForm;