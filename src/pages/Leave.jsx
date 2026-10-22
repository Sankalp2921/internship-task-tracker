
import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./leave.css";

const API = `${import.meta.env.VITE_API_URL}/api/leave`;

function getToken(user) {
  if (user?.token) return user.token;

  try {
    const saved = JSON.parse(localStorage.getItem("currentUser") || "{}");
    return saved.token || "";
  } catch {
    return "";
  }
}

function Leave() {
  const { user } = useAuth();
  const token = getToken(user);

  const [form, setForm] = useState({
    leaveFrom: "",
    leaveTo: "",
    subject: "",
    reason: "",
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    try {
      const response = await fetch(`${API}/my-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Could not load requests.");

      setRequests(data.leaveRequests || []);
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

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (form.leaveTo < form.leaveFrom) {
      setError("The end date cannot be before the start date.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Submission failed.");

      setMessage("Leave request submitted successfully.");
      setForm({ leaveFrom: "", leaveTo: "", subject: "", reason: "" });
      await loadRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="leave-page">
      <header className="leave-heading">
        <p>WORKSPACE / LEAVE</p>
        <h1>Leave Requests</h1>
        <span>Apply for leave and track your request status.</span>
      </header>

      <section className="leave-panel">
        <h2>Apply for leave</h2>

        <form onSubmit={handleSubmit} className="leave-form">
          <div className="leave-date-row">
            <label>
              Leave from
              <input
                type="date"
                name="leaveFrom"
                value={form.leaveFrom}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Leave to
              <input
                type="date"
                name="leaveTo"
                min={form.leaveFrom || undefined}
                value={form.leaveTo}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label>
            Subject
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="e.g. Personal leave"
              maxLength={120}
              required
            />
          </label>

          <label>
            Reason
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Explain why you need leave..."
              rows={4}
              maxLength={2000}
              required
            />
          </label>

          {message && <p className="leave-success">{message}</p>}
          {error && <p className="leave-error">{error}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit leave request"}
          </button>
        </form>
      </section>

      <section className="leave-panel">
        <h2>My request history</h2>

        {loading ? (
          <p>Loading requests...</p>
        ) : requests.length === 0 ? (
          <p>You haven't submitted any leave requests yet.</p>
        ) : (
          <div className="leave-table-wrap">
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Dates</th>
                  <th>Subject</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Admin comment</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td>{request.leaveFrom} – {request.leaveTo}</td>
                    <td>{request.subject}</td>
                    <td>{request.reason}</td>
                    <td>
                      <span className={`leave-status ${request.status.toLowerCase()}`}>
                        {request.status}
                      </span>
                    </td>
                    <td>{request.adminComment || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default Leave;
