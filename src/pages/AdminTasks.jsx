import React, {
  useEffect,
  useRef,
  useState,
} from "react";



import { useSearchParams } from "react-router-dom";



import { useAuth } from "../context/AuthContext";





// ==========================================

// API URL

// ==========================================



const API_URL = (

  import.meta.env.VITE_API_URL ||

  "http://localhost:5001"

).replace(/\/$/, "");





// ==========================================

// ADMIN TASKS

// ==========================================



function AdminTasks() {



  const { user } = useAuth();



  const [tasks, setTasks] = useState([]);



  const [loading, setLoading] =

    useState(true);



  const [error, setError] =

    useState("");



  const [success, setSuccess] =

    useState("");



  const [resourceTaskId, setResourceTaskId] =

  useState(null);



const [resourceTitle, setResourceTitle] =

  useState("");



const [resourceUrl, setResourceUrl] =

  useState("");



const [addingResource, setAddingResource] =

  useState(false);

  const [resourceFileTitle, setResourceFileTitle] =
    useState("");

  const [resourceFile, setResourceFile] =
    useState(null);

  const [addingFileResource, setAddingFileResource] =
    useState(false);

  const resourceFileInputRef = useRef(null);

  const [search, setSearch] =

    useState("");



  // Track expanded submission section

  const [expandedTaskId, setExpandedTaskId] =

    useState(null);



  const [searchParams] =

    useSearchParams();



  const urlStatus =

    searchParams.get("status");



  const [status, setStatus] =

    useState(

      urlStatus || "All"

    );





  // ==========================================

  // EDIT STATE

  // ==========================================



  const [editingTask, setEditingTask] =

    useState(null);



  const [editForm, setEditForm] =

    useState({

      title: "",

      description: "",

      priority: "medium",

      deadline: "",

    });





  // ==========================================

  // GET ALL TASKS

  // ==========================================



  const loadTasks = async () => {



    if (!user || !user.token) {



      setError(

        "You are not logged in."

      );



      setLoading(false);



      return;

    }





    try {



      const response =

        await fetch(

          `${API_URL}/api/tasks/admin/all`,

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



        setError(

          data.message ||

            "Unable to fetch tasks."

        );



        return;

      }





      setTasks(

        data.tasks || []

      );



    } catch (error) {



      console.error(

        "Fetch admin tasks error:",

        error

      );



      setError(

        "Unable to connect to the server."

      );



    } finally {



      setLoading(false);

    }

  };





  // ==========================================

  // LOAD TASKS

  // ==========================================



  useEffect(() => {



    loadTasks();



  }, [user]);





  // ==========================================

  // DELETE TASK

  // ==========================================



  const handleDelete = async (

    taskId

  ) => {



    setError("");

    setSuccess("");





    const confirmDelete =

      window.confirm(

        "Are you sure you want to delete this task?"

      );





    if (!confirmDelete) {

      return;

    }





    try {



      const response =

        await fetch(

          `${API_URL}/api/tasks/admin/${taskId}`,

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



        alert(

          data.message ||

            "Unable to delete task."

        );



        return;

      }





      alert(

        "Task deleted successfully."

      );





      // Remove deleted task

      // from UI



      setTasks(

        (previousTasks) =>

          previousTasks.filter(

            (task) =>

              task._id !== taskId

          )

      );



    } catch (error) {



      console.error(

        "Delete task error:",

        error

      );



      alert(

        "Unable to connect to the server."

      );

    }

  };





  // ==========================================

  // OPEN EDIT FORM

  // ==========================================



  const handleEdit = (task) => {



    setEditingTask(task);



    setEditForm({

      title: task.title,



      description:

        task.description,



      priority:

        task.priority,



      deadline: task.deadline

        ? task.deadline.substring(

            0,

            10

          )

        : "",

    });

  };





  // ==========================================

  // EDIT INPUT CHANGE

  // ==========================================



  const handleEditChange = (e) => {



    setEditForm({

      ...editForm,



      [e.target.name]:

        e.target.value,

    });

  };





  // ==========================================

  // UPDATE TASK

  // ==========================================



  const handleUpdate = async (e) => {



    e.preventDefault();



    setError("");

    setSuccess("");





    try {



      const response =

        await fetch(

          `${API_URL}/api/tasks/admin/${editingTask._id}`,

          {

            method: "PATCH",



            headers: {

              "Content-Type":

                "application/json",



              Authorization:

                `Bearer ${user.token}`,

            },



            body:

              JSON.stringify(

                editForm

              ),

          }

        );





      const data =

        await response.json();





      if (!response.ok) {



        alert(

          data.message ||

            "Unable to update task."

        );



        return;

      }





      alert(

        "Task updated successfully."

      );





      // Update task in UI



      setTasks(

        (previousTasks) =>

          previousTasks.map(

            (task) =>

              task._id ===

              editingTask._id

                ? data.task

                : task

          )

      );





      // Close edit form



      setEditingTask(null);



    } catch (error) {



      console.error(

        "Update task error:",

        error

      );



      alert(

        "Unable to connect to the server."

      );

    }

  };





  // ==========================================

// ADD URL RESOURCE

// ADMIN ONLY

// ==========================================



const handleAddUrlResource = async (

  taskId

) => {

  if (!resourceTitle.trim() || !resourceUrl.trim()) {

    alert("Please enter both title and URL.");

    return;

  }



  setAddingResource(true);



  try {

    const response = await fetch(

      `${API_URL}/api/tasks/admin/${taskId}/resources/url`,

      {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

          Authorization: `Bearer ${user.token}`,

        },

        body: JSON.stringify({

          title: resourceTitle.trim(),

          url: resourceUrl.trim(),

        }),

      }

    );



    const data = await response.json();



    if (!response.ok) {

      alert(

        data.message ||

          "Unable to add URL resource."

      );

      return;

    }



    // Update the task in the UI

    setTasks((previousTasks) =>

      previousTasks.map((task) =>

        task._id === taskId

          ? {

              ...task,

              resources: data.task.resources,

            }

          : task

      )

    );



    setResourceTitle("");

    setResourceUrl("");

    setResourceTaskId(null);



    alert("URL resource added successfully.");

  } catch (error) {

    console.error(

      "Add URL resource error:",

      error

    );



    alert(

      "Unable to connect to the server."

    );

  } finally {

    setAddingResource(false);

  }

};



  // ==========================================

  // ADD DOCUMENT RESOURCE

  // ADMIN ONLY

  // ==========================================

  const handleAddFileResource = async (taskId) => {
    if (!resourceFileTitle.trim()) {
      alert("Please enter a resource title.");
      return;
    }

    if (!resourceFile) {
      alert("Please select a document.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];

    if (!allowedTypes.includes(resourceFile.type)) {
      alert("Only PDF, Word, PowerPoint, Excel and text documents are allowed.");
      return;
    }

    if (resourceFile.size > 25 * 1024 * 1024) {
      alert("File size must be 25 MB or less.");
      return;
    }

    setAddingFileResource(true);

    try {
      const formData = new FormData();
      formData.append("title", resourceFileTitle.trim());
      formData.append("file", resourceFile);

      const response = await fetch(
        `${API_URL}/api/tasks/admin/${taskId}/resources/file`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to upload document.");
        return;
      }

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task._id === taskId
            ? { ...task, resources: data.task.resources }
            : task
        )
      );

      setResourceFileTitle("");
      setResourceFile(null);
      if (resourceFileInputRef.current) {
        resourceFileInputRef.current.value = "";
      }
      setResourceTaskId(null);

      alert("Document uploaded successfully.");
    } catch (error) {
      console.error("Upload resource file error:", error);
      alert("Unable to connect to the server.");
    } finally {
      setAddingFileResource(false);
    }
  };

  // ==========================================

  // TOGGLE SUBMISSIONS

  // ==========================================



  const toggleSubmissions = (

    taskId

  ) => {



    setExpandedTaskId(

      (previousId) =>

        previousId === taskId

          ? null

          : taskId

    );

  };





  // ==========================================

  // FILTER TASKS

  // ==========================================



  const filteredTasks =

    tasks.filter((task) => {



      const matchesSearch =

        task.title

          ?.toLowerCase()

          .includes(

            search.toLowerCase()

          );





      const matchesStatus =

        status === "All" ||

        task.status === status;





      return (

        matchesSearch &&

        matchesStatus

      );

    });





  // ==========================================

  // LOADING

  // ==========================================



  if (loading) {



    return (



      <main className="page">



        <div className="details-card">



          <h1>

            Loading Tasks...

          </h1>



          <p>

            Please wait while we

            load all tasks.

          </p>



        </div>



      </main>

    );

  }





  // ==========================================

  // PAGE

  // ==========================================



  return (



    <main className="page">



      {/* =========================

          HEADING

      ========================= */}



      <div className="page-heading">



        <h1>

          All Tasks

        </h1>



        <p>

          View and manage all

          internship tasks.

        </p>



      </div>





      {/* =========================

          ERROR

      ========================= */}



      {error && (



        <div className="auth-error">

          ❌ {error}

        </div>



      )}





      {/* =========================

          SUCCESS

      ========================= */}



      {success && (



        <div className="success-message">

          ✅ {success}

        </div>



      )}





      {/* =========================

          SEARCH AND FILTER

      ========================= */}



      <div className="filters">



        <input

          type="text"

          placeholder="🔍 Search tasks..."

          value={search}

          onChange={(e) =>

            setSearch(

              e.target.value

            )

          }

        />





        <select

          value={status}

          onChange={(e) =>

            setStatus(

              e.target.value

            )

          }

        >



          <option value="All">

            All

          </option>



          <option value="pending">

            Pending

          </option>



          <option value="in-progress">

            In Progress

          </option>



          <option value="completed">

            Completed

          </option>



        </select>



      </div>





      {/* =========================

          NO TASKS

      ========================= */}



      {filteredTasks.length === 0 ? (



        <div className="empty-tasks">



          <div className="empty-task-icon">

            📋

          </div>



          <h3>

            No tasks yet

          </h3>



          <p>

            No tasks match your

            search or filter.

          </p>



        </div>



      ) : (



        <div className="task-grid">



          {filteredTasks.map(

            (task) => (



              <div

                className="details-card"

                key={task._id}

              >



                {/* =========================

                    TITLE

                ========================= */}



                <h2>

                  {task.title}

                </h2>





                {/* =========================

                    DESCRIPTION

                ========================= */}



                <p>

                  {task.description}

                </p>





                {/* =========================

                    TASK INFORMATION

                ========================= */}



                <div className="details-grid">



                  <div>



                    <strong>

                      Assigned To

                    </strong>



                    <p>

                      {task.assignedTo?.name ||

                        "Unknown"}

                    </p>



                  </div>





                  <div>



                    <strong>

                      Email

                    </strong>



                    <p>

                      {task.assignedTo?.email ||

                        "Unknown"}

                    </p>



                  </div>





                  <div>



                    <strong>

                      Status

                    </strong>



                    <p>

                      {task.status}

                    </p>



                  </div>





                  <div>



                    <strong>

                      Priority

                    </strong>



                    <p>

                      {task.priority}

                    </p>



                  </div>





                  <div>



                    <strong>

                      Deadline

                    </strong>



                    <p>

                      {task.deadline

                        ? new Date(

                            task.deadline

                          ).toLocaleDateString()

                        : "No deadline"}

                    </p>



                  </div>



                </div>



                {/* =========================

    ADMIN RESOURCES

========================= */}



<div className="admin-resources">

                  <div className="admin-resources-header">
                    <div className="admin-resources-title">
                      <span>📚</span>
                      <span>Resources for Employee</span>
                      <span className="resource-count">
                        {task.resources?.length || 0}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="resource-add-button"
                        onClick={() => {
                          setResourceTaskId(
                            resourceTaskId === task._id ? null : task._id
                          );
                          setResourceFileTitle("");
                          setResourceFile(null);
                          if (resourceFileInputRef.current) {
                            resourceFileInputRef.current.value = "";
                          }
                        }}
                      >
                        {resourceTaskId === task._id ? "Cancel" : "+ Add URL"}
                      </button>

                      <button
                        type="button"
                        className="resource-add-button"
                        onClick={() => {
                          setResourceTaskId(
                            resourceTaskId === `${task._id}-file`
                              ? null
                              : `${task._id}-file`
                          );
                          setResourceTitle("");
                          setResourceUrl("");
                          setResourceFileTitle("");
                          setResourceFile(null);
                          if (resourceFileInputRef.current) {
                            resourceFileInputRef.current.value = "";
                          }
                        }}
                      >
                        {resourceTaskId === `${task._id}-file`
                          ? "Cancel"
                          : "+ Add Document"}
                      </button>
                    </div>
                  </div>

                  {resourceTaskId === task._id && (
                    <div className="resource-form">
                      <input
                        type="text"
                        placeholder="Resource title"
                        value={resourceTitle}
                        onChange={(e) => setResourceTitle(e.target.value)}
                      />
                      <input
                        type="url"
                        placeholder="https://example.com"
                        value={resourceUrl}
                        onChange={(e) => setResourceUrl(e.target.value)}
                      />
                      <button
                        type="button"
                        className="resource-save-button"
                        disabled={addingResource}
                        onClick={() => handleAddUrlResource(task._id)}
                      >
                        {addingResource ? "Adding..." : "Add URL Resource"}
                      </button>
                    </div>
                  )}

                  {resourceTaskId === `${task._id}-file` && (
                    <div className="resource-form">
                      <input
                        type="text"
                        placeholder="Document title"
                        value={resourceFileTitle}
                        onChange={(e) => setResourceFileTitle(e.target.value)}
                      />
                      <input
                        ref={resourceFileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                        onChange={(e) => setResourceFile(e.target.files?.[0] || null)}
                      />

                      {resourceFile && (
                        <small style={{ display: "block", marginTop: "6px", color: "#64748b" }}>
                          Selected: {resourceFile.name}
                        </small>
                      )}

                      <button
                        type="button"
                        className="resource-save-button"
                        disabled={addingFileResource}
                        onClick={() => handleAddFileResource(task._id)}
                      >
                        {addingFileResource ? "Uploading..." : "Upload Document"}
                      </button>
                    </div>
                  )}

                  {task.resources && task.resources.length > 0 && (
                    <div className="admin-resource-list">
                      {task.resources.map((resource) => (
                        <div
                          className="admin-resource-item"
                          key={resource._id}
                        >
                          <div className="admin-resource-info">
                            <span className="admin-resource-icon">
                              {resource.type === "file" ? "📄" : "🔗"}
                            </span>
                            <div>
                              <strong>{resource.title}</strong>
                              <small>
                                {resource.type === "file"
                                  ? resource.fileName || "Document"
                                  : resource.url}
                              </small>
                            </div>
                          </div>

                          {resource.type === "file" ? (
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              <a
                                href={resource.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="resource-view-button"
                              >
                                View
                              </a>
                              <a
                                href={resource.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={resource.fileName}
                                className="resource-view-button"
                              >
                                Download
                              </a>
                            </div>
                          ) : (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="resource-view-button"
                            >
                              Open
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {!task.resources?.length && (
                    <p className="no-resources">
                      No resources added yet.
                    </p>
                  )}

                </div>

                {/* =========================

                    EMPLOYEE SUBMISSIONS

                ========================= */}



                <div className="admin-submissions">



                  {/* SUBMISSION HEADER */}



                  <div className="admin-submissions-header">



                    <div className="admin-submissions-title">



                      <span>

                        📎

                      </span>



                      <span>

                        Employee Submissions

                      </span>



                      <span className="submission-count">

                        {task.submissions?.length ||

                          0}

                      </span>



                    </div>





                    {task.submissions &&

                      task.submissions.length >

                        0 && (



                        <button

                          type="button"

                          className="submission-toggle-button"

                          onClick={() =>

                            toggleSubmissions(

                              task._id

                            )

                          }

                        >

                          {expandedTaskId ===

                          task._id

                            ? "Hide Files"

                            : "View Files"}

                        </button>



                      )}



                  </div>





                  {/* NO SUBMISSIONS */}



                  {(!task.submissions ||

                    task.submissions.length ===

                      0) && (



                    <p className="no-submissions">

                      No files submitted yet.

                    </p>



                  )}





                  {/* SUBMISSION LIST */}



                  {expandedTaskId ===

                    task._id &&

                    task.submissions &&

                    task.submissions.length >

                      0 && (



                      <div className="admin-submission-list">



                        {task.submissions.map(

                          (submission) => (



                            <div

                              key={

                                submission._id

                              }

                              className="admin-submission-item"

                            >



                              {/* =========================

                                  FILE INFORMATION

                              ========================= */}



                              <div className="admin-submission-file">



                                <span className="admin-submission-file-icon">

                                  📄

                                </span>





                                <div className="admin-submission-file-info">



                                  <strong className="admin-submission-file-name">

                                    {

                                      submission.fileName

                                    }

                                  </strong>





                                  <small className="admin-submission-file-meta">



                                    {submission.fileSize

                                      ? (

                                          submission.fileSize /

                                          1024 /

                                          1024

                                        ).toFixed(

                                          2

                                        ) +

                                        " MB"

                                      : "Unknown size"}



                                    {" • "}



                                    Uploaded:{" "}



                                    {submission.uploadedAt

                                      ? new Date(

                                          submission.uploadedAt

                                        ).toLocaleString()

                                      : "Unknown"}



                                  </small>



                                </div>



                              </div>





                              {/* =========================

                                  FILE ACTIONS

                              ========================= */}



                              <div className="admin-submission-actions">



                                <a

                                  href={

                                    submission.fileUrl

                                  }

                                  target="_blank"

                                  rel="noopener noreferrer"

                                  className="submission-view-button"

                                >

                                  👁️ View

                                </a>





                                <a

                                  href={

                                    submission.fileUrl

                                  }

                                  target="_blank"

                                  rel="noopener noreferrer"

                                  download={

                                    submission.fileName

                                  }

                                  className="submission-download-button"

                                >

                                  ⬇️ Download

                                </a>



                              </div>



                            </div>



                          )

                        )}



                      </div>



                    )}



                </div>





                {/* =========================

                    ACTION BUTTONS

                ========================= */}



                <div className="task-actions">



                  <button

                    className="edit-button"

                    onClick={() =>

                      handleEdit(task)

                    }

                  >

                    ✏️ Edit

                  </button>





                  <button

                    className="delete-button"

                    onClick={() =>

                      handleDelete(

                        task._id

                      )

                    }

                  >

                    🗑️ Delete

                  </button>



                </div>



              </div>



            )

          )}



        </div>



      )}





      {/* =========================

          EDIT FORM

      ========================= */}



      {editingTask && (



        <div className="edit-modal">



          <div className="edit-modal-content">



            <h2>

              Edit Task

            </h2>





            <form

              onSubmit={handleUpdate}

              className="task-form"

            >



              {/* TITLE */}



              <input

                type="text"

                name="title"

                placeholder="Task title"

                value={

                  editForm.title

                }

                onChange={

                  handleEditChange

                }

                required

              />





              {/* DESCRIPTION */}



              <textarea

                name="description"

                placeholder="Task description"

                value={

                  editForm.description

                }

                onChange={

                  handleEditChange

                }

                required

              />





              {/* PRIORITY */}



              <select

                name="priority"

                value={

                  editForm.priority

                }

                onChange={

                  handleEditChange

                }

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





              {/* DEADLINE */}



              <input

                type="date"

                name="deadline"

                value={

                  editForm.deadline

                }

                onChange={

                  handleEditChange

                }

              />





              {/* BUTTONS */}



              <div className="task-actions">



                <button

                  type="submit"

                  className="edit-button"

                >

                  💾 Save Changes

                </button>





                <button

                  type="button"

                  className="delete-button"

                  onClick={() =>

                    setEditingTask(

                      null

                    )

                  }

                >

                  ❌ Cancel

                </button>



              </div>



            </form>



          </div>



        </div>



      )}



    </main>

  );

}





export default AdminTasks;