
import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./leave.css";

const API = "http://localhost:5001/api/leave";

function getToken(user) {
  if (user?.token) return user.token;

  try {
    return JSON.parse(localStorage.getItem("currentUser") || "{}").token || "";
  } catch {
    return "";
  }
}

function AdminLeaves() {
  const { user } = useAuth();
  const token = getToken(user);

  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("All");
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRequests = useCallback(async () => {
    try {
      const response = await fetch(`${API}/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Could not load requests.");

      setRequests(data.leaveRequests || []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadRequests();
    else {
      setError("Please log in again to continue.");
      setLoading(false);
    }
  }, [token, loadRequests]);

  const reviewRequest = async (id, status) => {
    setBusyId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/admin/${id}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          adminComment: comments[id] || "",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Review failed.");

      setMessage(`Leave request ${status.toLowerCase()} successfully.`);
      await loadRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  };

  const visibleRequests = requests.filter(
    (request) => filter === "All" || request.status === filter
  );

  const counts = {
    Pending: requests.filter((r) => r.status === "Pending").length,
    Approved: requests.filter((r) => r.status === "Approved").length,
    Rejected: requests.filter((r) => r.status === "Rejected").length,
  };

  return (
    <main className="leave-page">
      <header className="leave-heading">
        <p>ADMIN WORKSPACE / LEAVE</p>
        <h1>Leave Management</h1>
        <span>Review employee leave applications.</span>
      </header>

      <div className="leave-stats">
        {Object.entries(counts).map(([status, count]) => (
          <div className="leave-stat" key={status}>
            <span>{status} requests</span>
            <strong>{count}</strong>
          </div>
        ))}
      </div>

      <section className="leave-panel">
        <div className="leave-list-heading">
          <h2>Employee requests</h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>

        {message && <p className="leave-success">{message}</p>}
        {error && <p className="leave-error">{error}</p>}

        {loading ? (
          <p>Loading requests...</p>
        ) : visibleRequests.length === 0 ? (
          <p>No requests found for this filter.</p>
        ) : (
          <div className="leave-request-list">
            {visibleRequests.map((request) => (
              <article className="leave-request-card" key={request._id}>
                <div className="leave-request-top">
                  <div>
                    <h3>{request.employee?.name || "Unknown employee"}</h3>
                    <p>{request.employee?.email || "No email available"}</p>
                  </div>
                  <span className={`leave-status ${request.status.toLowerCase()}`}>
                    {request.status}
                  </span>
                </div>

                <div className="leave-request-details">
                  <p><strong>Dates:</strong> {request.leaveFrom} – {request.leaveTo}</p>
                  <p><strong>Subject:</strong> {request.subject}</p>
                  <p><strong>Reason:</strong> {request.reason}</p>
                  {request.reviewedBy && (
                    <p><strong>Reviewed:</strong> {request.reviewedAt
                      ? new Date(request.reviewedAt).toLocaleString()
                      : "Yes"}</p>
                  )}
                  {request.adminComment && (
                    <p><strong>Previous comment:</strong> {request.adminComment}</p>
                  )}
                </div>

                {request.status === "Pending" && (
                  <div className="leave-review">
                    <label>
                      Admin comment (optional)
                      <textarea
                        rows={2}
                        value={comments[request._id] || ""}
                        onChange={(e) =>
                          setComments((previous) => ({
                            ...previous,
                            [request._id]: e.target.value,
                          }))
                        }
                        placeholder="Add a comment..."
                      />
                    </label>

                    <div className="leave-actions">
                      <button
                        type="button"
                        disabled={busyId === request._id}
                        onClick={() => reviewRequest(request._id, "Approved")}
                      >
                        {busyId === request._id ? "Saving..." : "Approve"}
                      </button>
                      <button
                        type="button"
                        className="leave-reject-button"
                        disabled={busyId === request._id}
                        onClick={() => reviewRequest(request._id, "Rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminLeaves;
