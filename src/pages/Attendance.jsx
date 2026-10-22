import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {

  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,

  Tooltip, XAxis, YAxis

} from "recharts";

import { useAuth } from "../context/AuthContext";

import "../index.css";



const DAILY_TARGET_MINUTES = 480;

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/+$/, "");



const STATUS_COLORS = {

  Present: "#16a34a",

  Late: "#f97316",

  Absent: "#ef4444",

  Leave: "#f59e0b"

};





function formatTime(value) {

  if (!value) return "--";

  return new Date(value).toLocaleTimeString("en-IN", {

    hour: "2-digit", minute: "2-digit", hour12: true

  });

}



function formatDuration(totalMinutes = 0) {

  const minutes = Math.max(0, Number(totalMinutes) || 0);

  return `${Math.floor(minutes / 60)}h ${String(Math.floor(minutes % 60)).padStart(2, "0")}m`;

}



function formatDate(dateString) {

  if (!dateString) return "--";

  // Parse YYYY-MM-DD as a local calendar date, avoiding UTC date shifts.

  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {

    day: "2-digit", month: "short", year: "numeric"

  });

}



function getMinutesForRecord(record, now = Date.now()) {

  if (record.checkIn && !record.checkOut) {

    return Math.max(0, Math.floor((now - new Date(record.checkIn).getTime()) / 60000));

  }

  return Math.max(0, Number(record.totalMinutes) || 0);

}



function getStatus(record) {

  if (record.status === "Leave") return "Leave";

  if (record.status === "Absent") return "Absent";

  if (record.status === "Late") return "Late";

  if (record.checkIn) return "Present";

  return record.status || "Unmarked";

}





function Attendance() {

  const { user } = useAuth();

  const [attendance, setAttendance] = useState(null);

  const [summary, setSummary] = useState(null);

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [historyError, setHistoryError] = useState("");

  const [now, setNow] = useState(Date.now());



  // Camera verification state

  const [cameraOpen, setCameraOpen] = useState(false);

  const [cameraAction, setCameraAction] = useState(null);

  const [capturedPhoto, setCapturedPhoto] = useState(null);

  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);

  const canvasRef = useRef(null);

  const streamRef = useRef(null);



  const request = useCallback(async (path) => {

    const response = await fetch(`${API_BASE}${path}`, {

      headers: { Authorization: `Bearer ${user.token}` }

    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Request failed.");

    return data;

  }, [user?.token]);



  const refreshDashboard = useCallback(async (showLoading = false) => {

    if (!user?.token) {

      setLoading(false);

      return;

    }

    if (showLoading) setLoading(true);

    const results = await Promise.allSettled([

      request("/api/attendance/today"),

      request("/api/attendance/summary"),

      request("/api/attendance/history?limit=30")

    ]);



    if (results[0].status === "fulfilled") {

      setAttendance(results[0].value.attendance || null);

    } else {

      setMessage(results[0].reason.message || "Unable to load today's attendance.");

    }



    if (results[1].status === "fulfilled") {

      setSummary(results[1].value.summary || null);

    } else {

      setMessage((current) => current || results[1].reason.message || "Unable to load summary.");

    }



    if (results[2].status === "fulfilled") {

      setHistory(Array.isArray(results[2].value.history) ? results[2].value.history : []);

      setHistoryError("");

    } else {

      setHistoryError(results[2].reason.message || "Unable to load attendance history.");

    }

    setLoading(false);

  }, [request, user?.token]);



  useEffect(() => {

    refreshDashboard(true);

    const refreshInterval = window.setInterval(() => {

      setNow(Date.now());

      refreshDashboard(false);

    }, 60000);

    return () => window.clearInterval(refreshInterval);

  }, [refreshDashboard]);



  const stopCamera = useCallback(() => {

    if (streamRef.current) {

      streamRef.current.getTracks().forEach((track) => track.stop());

      streamRef.current = null;

    }

    if (videoRef.current) videoRef.current.srcObject = null;

  }, []);



  useEffect(() => () => stopCamera(), [stopCamera]);



  const openCamera = async (action) => {

    setCameraAction(action);

    setCapturedPhoto(null);

    setCameraError("");

    setCameraOpen(true);

    try {

      const stream = await navigator.mediaDevices.getUserMedia({

        video: { facingMode: "user" }, audio: false

      });

      streamRef.current = stream;

      if (videoRef.current) videoRef.current.srcObject = stream;

    } catch (error) {

      console.error("Camera error:", error);

      setCameraError("Unable to access camera. Allow camera permission and try again.");

    }

  };



  const closeCamera = () => {

    stopCamera();

    setCameraOpen(false);

    setCameraAction(null);

    setCapturedPhoto(null);

    setCameraError("");

  };



  const capturePhoto = () => {

    const video = videoRef.current;

    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    if (!video.videoWidth || !video.videoHeight) {

      setCameraError("Camera is not ready yet. Please wait a moment.");

      return;

    }

    canvas.width = video.videoWidth;

    canvas.height = video.videoHeight;

    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    setCapturedPhoto(canvas.toDataURL("image/jpeg", 0.85));

    stopCamera();

  };



  const retakePhoto = async () => {

    setCapturedPhoto(null);

    setCameraError("");

    try {

      const stream = await navigator.mediaDevices.getUserMedia({

        video: { facingMode: "user" }, audio: false

      });

      streamRef.current = stream;

      if (videoRef.current) videoRef.current.srcObject = stream;

    } catch (error) {

      console.error("Camera error:", error);

      setCameraError("Unable to access camera. Allow camera permission and try again.");

    }

  };



  const getCurrentLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("This browser does not support location services."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          const message =
            error.code === error.PERMISSION_DENIED
              ? "Location permission was denied. Allow location access in your browser settings and try again."
              : error.code === error.POSITION_UNAVAILABLE
                ? "Your current location is unavailable. Check your device location settings and try again."
                : "Getting your location timed out. Please try again.";
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });

  const confirmAttendance = async () => {
    if (!user?.token || !cameraAction || !capturedPhoto) return;

    setActionLoading(true);
    setMessage("");

    const endpoint =
      cameraAction === "check-in"
        ? "/api/attendance/check-in"
        : "/api/attendance/check-out";

    try {
      // Capture a fresh location at the moment attendance is confirmed.
      const location = await getCurrentLocation();

      const imageResponse = await fetch(capturedPhoto);
      const photoBlob = await imageResponse.blob();
      const formData = new FormData();

      // Send GPS fields with the existing selfie upload.
      formData.append("latitude", String(location.latitude));
      formData.append("longitude", String(location.longitude));
      formData.append("accuracy", String(location.accuracy));
      formData.append("photo", photoBlob, "attendance.jpg");

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Attendance action failed.");
      }

      setAttendance(data.attendance || null);
      const distance = data.attendance?.[
        cameraAction === "check-in" ? "checkInLocation" : "checkOutLocation"
      ]?.distanceMeters;

      setMessage(
        `${cameraAction === "check-in" ? "Check-in" : "Check-out"} successful.${
          Number.isFinite(distance)
            ? ` Distance from office: ${Math.round(distance)} metres.`
            : ""
        }`
      );

      closeCamera();
      await refreshDashboard(false);
    } catch (error) {
      console.error("Attendance action error:", error);
      setMessage(error.message || "Unable to connect to the server.");
    } finally {
      setActionLoading(false);
    }
  };


  const liveTodayMinutes = useMemo(() => {

    if (attendance?.checkIn && !attendance?.checkOut) {

      return Math.max(0, Math.floor((now - new Date(attendance.checkIn).getTime()) / 60000));

    }

    return Number(attendance?.totalMinutes) || 0;

  }, [attendance, now]);



  const progress = Math.min(100, Math.round((liveTodayMinutes / DAILY_TARGET_MINUTES) * 100));

  const remainingMinutes = Math.max(0, DAILY_TARGET_MINUTES - liveTodayMinutes);

  const greetingName = user?.name || user?.user?.name || "there";



  const chartHistory = useMemo(() => {

    const days = [];

    const today = new Date();

    for (let i = 6; i >= 0; i -= 1) {

      const date = new Date(today);

      date.setDate(today.getDate() - i);

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const record = history.find((item) => item.date === key);

      days.push({

        date: key,

        day: date.toLocaleDateString("en-IN", { weekday: "short" }),

        hours: record ? Number((getMinutesForRecord(record, now) / 60).toFixed(2)) : 0

      });

    }

    return days;

  }, [history, now]);



  const statusData = useMemo(() => {

        const counts = {

          Present: 0,

          Late: 0,

          Absent: 0,

          Leave: 0

        };

    history.forEach((record) => {

      const status = getStatus(record);

      if (Object.prototype.hasOwnProperty.call(counts, status)) counts[status] += 1;

    });

    return Object.entries(counts).map(([name, value]) => ({

      name, value, color: STATUS_COLORS[name]

    })).filter((item) => item.value > 0);

  }, [history]);



  const averageTime = (field) => {

    const values = history

      .filter((item) => item[field])

      .map((item) => {

        const date = new Date(item[field]);

        return date.getHours() * 60 + date.getMinutes();

      });

    if (!values.length) return "--";

    const average = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

    const date = new Date();

    date.setHours(Math.floor(average / 60), average % 60, 0, 0);

    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  };



  if (loading) {

    return <main className="page attendance-page"><div className="attendance-loading">Loading your attendance dashboard…</div></main>;

  }



  return (

    <main className="page attendance-page">

      <header className="attendance-page-header">

        <div>

          <span className="dashboard-label">WORKSPACE / ATTENDANCE</span>

          <h1>Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {greetingName.split(" ")[0]}!</h1>

          <p>Here’s your personal attendance and working-hours overview.</p>

        </div>

        <div className="attendance-date-chip">

          <span className="date-chip-icon">◷</span>

          <div><small>Today</small><strong>{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</strong></div>

        </div>

      </header>



      {message && <div className="attendance-message" role="status">{message}<button onClick={() => setMessage("")} aria-label="Dismiss message">×</button></div>}



      <section className="attendance-dashboard-grid">

        <article className="attendance-panel today-panel">

          <div className="panel-heading">

            <div><span className="panel-eyebrow">TODAY</span><h2>My attendance</h2><p>Your workday at a glance</p></div>

            <span className="panel-icon blue">◷</span>

          </div>

          <div className="today-main">

            <div className="progress-ring" style={{ "--progress": `${progress * 3.6}deg` }}>

              <div className="progress-ring-inner">

                <strong>{progress}%</strong><span>of 8 hours</span>

              </div>

            </div>

            <div className="today-status">

              <span className={`status-pill ${attendance?.checkIn ? attendance?.checkOut ? "status-complete" : "status-active" : "status-pending"}`}>

                <i />{attendance?.checkOut ? "Completed" : attendance?.checkIn ? "Checked in" : "Not checked in"}

              </span>

              <h3>{formatDuration(liveTodayMinutes)}</h3>

              <p>{attendance?.checkIn && !attendance?.checkOut

                ? `${formatDuration(remainingMinutes)} to reach your 8-hour target`

                : attendance?.checkOut ? "Your attendance for today is complete" : "Check in to start recording your workday"}</p>

            </div>

          </div>

          <div className="today-time-grid">

            <div><span><i className="time-dot green" />Check in</span><strong>{formatTime(attendance?.checkIn)}</strong></div>

            <div><span><i className="time-dot orange" />Check out</span><strong>{formatTime(attendance?.checkOut)}</strong></div>

          </div>

          <div className="attendance-button-area">

            {!attendance?.checkIn ? (

              <button className="attendance-check-in-btn" onClick={() => openCamera("check-in")} disabled={actionLoading}>↗ Check in with selfie</button>

            ) : !attendance?.checkOut ? (

              <button className="attendance-check-out-btn" onClick={() => openCamera("check-out")} disabled={actionLoading}>↗ Check out with selfie</button>

            ) : <div className="attendance-completed-message">✓ Today’s attendance is completed</div>}

          </div>

        </article>



        <article className="attendance-panel quick-stats-panel">

          <div className="panel-heading"><div><span className="panel-eyebrow">YOUR TOTALS</span><h2>Working hours</h2><p>Time tracked in each period</p></div><span className="panel-icon violet">▦</span></div>

          <div className="quick-stat-list">

            <div className="quick-stat-row"><span className="quick-stat-symbol today-symbol">D</span><div><span>Today</span><small>Current workday</small></div><strong>{formatDuration(summary?.todayMinutes ?? liveTodayMinutes)}</strong></div>

            <div className="quick-stat-row"><span className="quick-stat-symbol week-symbol">W</span><div><span>This week</span><small>Since Monday</small></div><strong>{formatDuration(summary?.weekMinutes || 0)}</strong></div>

            <div className="quick-stat-row"><span className="quick-stat-symbol month-symbol">M</span><div><span>This month</span><small>Month to date</small></div><strong>{formatDuration(summary?.monthMinutes || 0)}</strong></div>

            <div className="quick-stat-row"><span className="quick-stat-symbol year-symbol">Y</span><div><span>This year</span><small>Year to date</small></div><strong>{formatDuration(summary?.yearMinutes || 0)}</strong></div>

          </div>

          <div className="target-note"><span>Daily target</span><strong>8h 00m</strong><div className="target-track"><span style={{ width: `${progress}%` }} /></div></div>

        </article>



        <article className="attendance-panel chart-panel hours-chart-panel">

          <div className="panel-heading"><div><span className="panel-eyebrow">CONSISTENCY</span><h2>Working hours trend</h2><p>Last 7 calendar days · hours per day</p></div><span className="panel-icon blue">▥</span></div>

          <div className="attendance-chart">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart data={chartHistory} margin={{ top: 8, right: 6, left: -20, bottom: 0 }}>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf1f6" />

                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#8290a5", fontSize: 12 }} />

                <YAxis domain={[0, 8]} ticks={[0, 2, 4, 6, 8]} axisLine={false} tickLine={false} tick={{ fill: "#8290a5", fontSize: 11 }} />

                <Tooltip formatter={(value) => [`${value} hours`, "Working time"]} labelFormatter={(label) => `Day: ${label}`} cursor={{ fill: "#f5f8fc" }} />

                <Bar dataKey="hours" fill="#4f7df3" radius={[6, 6, 0, 0]} maxBarSize={34} />

              </BarChart>

            </ResponsiveContainer>

          </div>

          <div className="chart-footnote"><span><i className="legend-dot blue-dot" />Hours recorded</span><span>Target: 8h/day</span></div>

        </article>



        <article className="attendance-panel chart-panel status-chart-panel">

          <div className="panel-heading"><div><span className="panel-eyebrow">LAST 30 RECORDS</span><h2>Attendance breakdown</h2><p>Based on saved attendance records</p></div><span className="panel-icon green">◉</span></div>

          {statusData.length ? <>

            <div className="status-chart-wrap">

              <div className="status-donut">

                <ResponsiveContainer width="100%" height="100%">

                  <PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius="68%" outerRadius="92%" paddingAngle={4} stroke="none">

                    {statusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}

                  </Pie><Tooltip /></PieChart>

                </ResponsiveContainer>

                <div className="donut-center"><strong>{history.length}</strong><span>records</span></div>

              </div>

              <div className="status-legend">{statusData.map((item) => <div key={item.name}><span><i style={{ background: item.color }} />{item.name}</span><strong>{item.value}</strong></div>)}</div>

            </div>

          </> : <div className="chart-empty"><span>◉</span><strong>No attendance data yet</strong><p>Your saved attendance records will appear here.</p></div>}

        </article>

      </section>



      <section className="attendance-history-section attendance-panel">

        <div className="history-heading">

          <div><span className="panel-eyebrow">YOUR RECORDS</span><h2>Recent attendance</h2><p>Your latest saved check-in and check-out activity</p></div>

          <span className="history-count">{history.length} records</span>

        </div>

        {historyError ? <div className="history-feedback">{historyError}</div> : history.length === 0 ? (

          <div className="chart-empty history-empty"><span>▤</span><strong>No attendance history yet</strong><p>After your first check-in, your records will appear here.</p></div>

        ) : (

          <div className="attendance-table-wrap">

            <table className="attendance-table">

              <thead><tr><th>Date</th><th>Check in</th><th>Check out</th><th>Working hours</th><th>Status</th></tr></thead>

              <tbody>{history.map((record) => {

                const status = getStatus(record);

                return <tr key={record._id || `${record.date}-${record.employee}`}>

                  <td><strong>{formatDate(record.date)}</strong><small>{record.date === new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) ? "Today" : "Attendance record"}</small></td>

                  <td>{formatTime(record.checkIn)}</td>

                  <td>{formatTime(record.checkOut)}</td>

                  <td><strong>{formatDuration(getMinutesForRecord(record, now))}</strong></td>

                  <td><span className={`table-status status-${status.toLowerCase()}`}><i />{status}</span></td>

                </tr>;

              })}</tbody>

            </table>

          </div>

        )}

      </section>



      {cameraOpen && <div className="attendance-camera-overlay" role="dialog" aria-modal="true" aria-label="Attendance photo verification">

        <div className="attendance-camera-modal">

          <div className="attendance-camera-header"><div><span className="dashboard-card-label">ATTENDANCE VERIFICATION</span><h2>{cameraAction === "check-in" ? "Check in" : "Check out"}</h2><p>Capture a selfie to verify your attendance.</p></div><button className="attendance-camera-close" onClick={closeCamera} aria-label="Close camera">×</button></div>

          {cameraError ? <div className="attendance-camera-error"><div className="attendance-camera-error-icon">📷</div><h3>Camera access required</h3><p>{cameraError}</p><button className="attendance-camera-primary-btn" onClick={retakePhoto}>Try again</button></div>

          : capturedPhoto ? <div className="attendance-photo-preview"><img src={capturedPhoto} alt="Attendance verification preview" /><div className="attendance-camera-actions"><button className="attendance-camera-secondary-btn" onClick={retakePhoto} disabled={actionLoading}>Retake photo</button><button className="attendance-camera-primary-btn" onClick={confirmAttendance} disabled={actionLoading}>{actionLoading ? "Saving…" : "Confirm attendance"}</button></div></div>

          : <div className="attendance-camera-content"><div className="attendance-video-wrapper"><video ref={videoRef} autoPlay playsInline muted /></div><p className="attendance-camera-instruction">Position yourself clearly in the camera and capture a photo.</p><div className="attendance-camera-actions"><button className="attendance-camera-secondary-btn" onClick={closeCamera}>Cancel</button><button className="attendance-camera-primary-btn" onClick={capturePhoto}>Capture photo</button></div></div>}

          <canvas ref={canvasRef} hidden />

        </div>

      </div>}

    </main>

  );

}



export default Attendance;
