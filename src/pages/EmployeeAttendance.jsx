import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5001"
).replace(/\/+$/, "");

const COLORS = {
  blue: "#4778f5",
  green: "#16a34a",
  orange: "#ea580c",
  purple: "#7c3aed",
  gray: "#94a3b8",
  text: "#172033",
  muted: "#64748b",
  border: "#e5ebf3",
  background: "#f4f7fb",
};

const getToday = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
};

const formatTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const formatMinutes = (minutes = 0) => {
  const safeMinutes = Math.max(0, Number(minutes) || 0);
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = Math.floor(safeMinutes % 60);

  return `${hours}h ${String(remainingMinutes).padStart(2, "0")}m`;
};


const formatDistance = (meters) => {
  if (
    meters === null ||
    meters === undefined ||
    meters === "" ||
    !Number.isFinite(Number(meters))
  ) {
    return "—";
  }

  const distance = Math.max(0, Number(meters));

  if (distance < 1000) {
    return `${Math.round(distance)} m`;
  }

  return `${(distance / 1000).toFixed(2)} km`;
};

const statusColor = (status) => {
  switch (status) {
    case "Present":
      return { background: "#dcfce7", color: "#166534" };
    case "Late":
      return { background: "#ffedd5", color: "#9a3412" };
    case "Absent":
      return { background: "#fee2e2", color: "#991b1b" };
    case "Leave":
      return { background: "#dbeafe", color: "#1d4ed8" };
    default:
      return { background: "#f1f5f9", color: "#475569" };
  }
};

/* Circular progress indicator */
function ProgressRing({
  value = 0,
  max = 100,
  color = COLORS.blue,
  label = "Progress",
  size = 110,
  showPercentage = true,
}) {
  const safeMax = Math.max(1, Number(max) || 0);
  const safeValue = Math.max(0, Number(value) || 0);

  const percentage = Math.min(100, (safeValue / safeMax) * 100);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        role="img"
        aria-label={`${label}: ${Math.round(percentage)} percent`}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#edf1f7"
          strokeWidth="9"
        />

        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 800ms ease",
          }}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <strong
          style={{
            fontSize: size > 120 ? "24px" : "21px",
            color: COLORS.text,
          }}
        >
          {showPercentage
            ? `${Math.round(percentage)}%`
            : safeValue}
        </strong>

        <span
          style={{
            fontSize: "10px",
            color: COLORS.muted,
            textAlign: "center",
            padding: "0 8px",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

/* Reusable dashboard metric card */
function MetricCard({
  title,
  value,
  description,
  color,
  icon,
  children,
}) {
  return (
    <article className="ea-card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            display: "grid",
            placeItems: "center",
            borderRadius: "13px",
            background: `${color}18`,
            color,
            fontSize: "20px",
            fontWeight: 800,
          }}
        >
          {icon}
        </div>

        <span
          style={{
            color: COLORS.muted,
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {title}
        </span>
      </div>

      <div
        style={{
          color: COLORS.text,
          fontSize: "27px",
          fontWeight: 800,
          marginBottom: "6px",
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: COLORS.muted,
          fontSize: "12px",
          lineHeight: 1.5,
        }}
      >
        {description}
      </div>

      {children}
    </article>
  );
}

/* Attendance distribution doughnut chart using SVG */
function AttendanceDonut({ present, late, notCheckedIn }) {
  const total = present + late + notCheckedIn;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    { label: "Present", value: present, color: COLORS.green },
    { label: "Late", value: late, color: COLORS.orange },
    {
      label: "Not checked in",
      value: notCheckedIn,
      color: COLORS.gray,
    },
  ];

  let accumulated = 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "26px",
      }}
    >
      <div style={{ position: "relative", width: 180, height: 180 }}>
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          role="img"
          aria-label="Attendance distribution chart"
        >
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#edf1f7"
            strokeWidth="19"
          />

          {total > 0 &&
            segments.map((segment) => {
              const dashLength =
                (segment.value / total) * circumference;
              const dashOffset = -accumulated;

              accumulated += dashLength;

              if (segment.value === 0) return null;

              return (
                <circle
                  key={segment.label}
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="19"
                  strokeDasharray={`${dashLength} ${
                    circumference - dashLength
                  }`}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 90 90)"
                  style={{
                    transition: "all 700ms ease",
                  }}
                />
              );
            })}
        </svg>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <strong style={{ fontSize: "31px", color: COLORS.text }}>
            {total}
          </strong>
          <span style={{ fontSize: "12px", color: COLORS.muted }}>
            Employees
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gap: "17px", minWidth: "145px" }}>
        {segments.map((segment) => (
          <div
            key={segment.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "22px",
            }}
          >
            <span
              style={{
                color: COLORS.muted,
                fontSize: "13px",
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  color: segment.color,
                  marginRight: "8px",
                }}
              >
                ●
              </span>
              {segment.label}
            </span>

            <strong style={{ color: COLORS.text }}>
              {segment.value}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EmployeeAttendance() {
  const [date, setDate] = useState(getToday);
  const [search, setSearch] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      let savedUser = null;

      try {
        savedUser = JSON.parse(
          localStorage.getItem("currentUser") || "null"
        );
      } catch {
        savedUser = null;
      }

      const token =
        user?.token ||
        savedUser?.token ||
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Login token missing. Please log out and log in again."
        );
      }

      const params = new URLSearchParams({ date });

      const response = await fetch(
        `${API_BASE}/api/admin/attendance?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            (response.status === 401 || response.status === 403
              ? "Your session is invalid or you do not have admin access."
              : "Unable to load employee attendance.")
        );
      }

      setAttendance(
        Array.isArray(data.attendance) ? data.attendance : []
      );
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  }, [date, user?.token]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const filteredAttendance = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return attendance;

    return attendance.filter((record) => {
      const name = record.employee?.name || "";
      const email = record.employee?.email || "";

      return (
        name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query)
      );
    });
  }, [attendance, search]);

  const totals = useMemo(() => {
    return filteredAttendance.reduce(
      (result, record) => {
        if (record.checkIn && record.status === "Present") {
          result.present += 1;
        }

        if (record.checkIn && record.status === "Late") {
          result.late += 1;
        }

        result.minutes += Math.max(
          0,
          Number(record.workingMinutes) || 0
        );

        return result;
      },
      { present: 0, late: 0, minutes: 0 }
    );
  }, [filteredAttendance]);

  const chartData = useMemo(() => {
    const listed = filteredAttendance.length;

    const checkedIn = filteredAttendance.filter(
      (record) => Boolean(record.checkIn)
    ).length;

    const notCheckedIn = Math.max(0, listed - checkedIn);

    return {
      listed,
      checkedIn,
      notCheckedIn,
      present: totals.present,
      late: totals.late,
      expectedMinutes: listed * 480,
      employees: filteredAttendance.map((record) => ({
        id: record.employee?._id || record.employee?.email,
        name: record.employee?.name || "Employee",
        minutes: Math.max(
          0,
          Number(record.workingMinutes) || 0
        ),
        status: record.status || "Unmarked",
      })),
    };
  }, [filteredAttendance, totals.present, totals.late]);

  const styles = {
    page: {
      padding: "clamp(16px, 3vw, 30px)",
      background: COLORS.background,
      minHeight: "calc(100vh - 70px)",
      color: COLORS.text,
      boxSizing: "border-box",
    },

    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "18px",
      flexWrap: "wrap",
      marginBottom: "25px",
    },

    title: {
      margin: 0,
      fontSize: "clamp(24px, 3vw, 31px)",
      fontWeight: 800,
      letterSpacing: "-0.7px",
    },

    subtitle: {
      margin: "8px 0 0",
      color: COLORS.muted,
      lineHeight: 1.6,
      fontSize: "14px",
      maxWidth: "580px",
    },

    controls: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      alignItems: "center",
    },

    input: {
      padding: "11px 13px",
      border: "1px solid #dbe2ea",
      borderRadius: "11px",
      background: "#fff",
      color: COLORS.text,
      fontSize: "14px",
      minHeight: "43px",
      boxSizing: "border-box",
      outlineColor: COLORS.blue,
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "17px",
      marginBottom: "22px",
    },

    panel: {
      background: "#fff",
      border: `1px solid ${COLORS.border}`,
      borderRadius: "18px",
      padding: "22px",
      boxShadow: "0 6px 22px rgba(15, 23, 42, 0.04)",
      minWidth: 0,
      animation: "eaFadeIn 450ms ease both",
    },

    button: {
      border: 0,
      borderRadius: "10px",
      background: COLORS.blue,
      color: "#fff",
      padding: "11px 17px",
      fontWeight: 700,
      cursor: "pointer",
      minHeight: "43px",
      transition: "transform 180ms ease, opacity 180ms ease",
    },

    tableCard: {
      background: "#fff",
      border: `1px solid ${COLORS.border}`,
      borderRadius: "18px",
      overflow: "hidden",
      boxShadow: "0 5px 18px rgba(15, 23, 42, 0.03)",
      animation: "eaFadeIn 550ms ease both",
    },

    tableHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      flexWrap: "wrap",
      padding: "21px",
      borderBottom: `1px solid ${COLORS.border}`,
    },

    tableWrap: {
      width: "100%",
      overflowX: "auto",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "1000px",
      fontSize: "13px",
    },

    th: {
      background: "#f8fafc",
      padding: "14px 16px",
      textAlign: "left",
      color: COLORS.muted,
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      whiteSpace: "nowrap",
    },

    td: {
      padding: "15px 16px",
      borderTop: "1px solid #edf1f6",
      whiteSpace: "nowrap",
      verticalAlign: "middle",
    },

    message: {
      padding: "28px",
      color: COLORS.muted,
      textAlign: "center",
    },

    error: {
      padding: "14px 16px",
      marginBottom: "18px",
      background: "#fee2e2",
      color: "#991b1b",
      borderRadius: "11px",
      lineHeight: 1.6,
    },
  };

  return (
    <main style={styles.page}>
      <style>
        {`
          @keyframes eaFadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes eaBarGrow {
            from { width: 0; }
          }

          .ea-card {
            background: #fff;
            border: 1px solid ${COLORS.border};
            border-radius: 18px;
            padding: 21px;
            min-width: 0;
            box-shadow: 0 6px 22px rgba(15,23,42,.045);
            transition: transform 200ms ease, box-shadow 200ms ease;
            animation: eaFadeIn 400ms ease both;
          }

          .ea-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 13px 28px rgba(15,23,42,.09);
          }

          .ea-table-row:hover {
            background: #f8fbff;
          }

          .ea-bar {
            animation: eaBarGrow 800ms ease both;
          }

          @media (prefers-reduced-motion: reduce) {
            .ea-card, .ea-bar {
              animation: none !important;
              transition: none !important;
            }
          }

/* Responsive attendance table and mobile cards */
.ea-mobile-records {
  display: none;
}

.ea-desktop-table {
  display: block;
  min-width: 0;
}

.ea-mobile-card {
  background: #fff;
  border: 1px solid #e5ebf3;
  border-radius: 14px;
  padding: 16px;
  margin: 12px;
  box-shadow: 0 3px 12px rgba(15, 23, 42, 0.04);
}

.ea-mobile-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 12px;
  margin-top: 16px;
}

.ea-mobile-field {
  min-width: 0;
}

.ea-mobile-label {
  color: #64748b;
  font-size: 11px;
  margin-bottom: 5px;
}

.ea-mobile-value {
  color: #172033;
  font-size: 13px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

@media (max-width: 640px) {
  .ea-controls {
    width: 100%;
    display: grid !important;
    grid-template-columns: minmax(0, 1fr);
  }

  .ea-controls input,
  .ea-controls button {
    width: 100%;
    min-width: 0 !important;
  }

  .ea-card {
    padding: 16px;
  }

  .ea-card:hover {
    transform: none;
  }

  .ea-mobile-records {
    display: block;
  }

  .ea-desktop-table {
    display: none;
  }

  .ea-mobile-card-grid {
    gap: 16px 10px;
  }
}

        `}
      </style>

      {/* Page heading and filters */}
      <header style={styles.header}>
        <div>
          <p
            style={{
              color: COLORS.blue,
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.13em",
              margin: "0 0 9px",
            }}
          >
            ADMIN WORKSPACE / ATTENDANCE
          </p>

          <h1 style={styles.title}>Employee Attendance</h1>

          <p style={styles.subtitle}>
            Track employee attendance, daily working hours,
            check-in/check-out times, and distance from the office.
          </p>
        </div>

<div className="ea-controls" style={styles.controls}>
          <input
            className="ea-date-input"
            aria-label="Choose attendance date"
            type="date"
            value={date}
            max={getToday()}
            onChange={(event) => setDate(event.target.value)}
            style={styles.input}
          />

          <input
            className="ea-search-input"
            aria-label="Search employees"
            type="search"
            placeholder="Search name or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ ...styles.input, minWidth: "205px" }}
          />

          <button
            type="button"
            onClick={fetchAttendance}
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.65 : 1,
            }}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </div>
      </header>

      {error && (
        <div role="alert" style={styles.error}>
          {error}
        </div>
      )}

      {/* Four graphical summary cards */}
      <section style={styles.grid}>
        <MetricCard
          title="Employees listed"
          value={chartData.listed}
          description={`${chartData.checkedIn} employee(s) checked in`}
          color={COLORS.blue}
          icon="♟"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "17px",
            }}
          >
            <ProgressRing
              value={chartData.checkedIn}
              max={chartData.listed}
              color={COLORS.blue}
              label="Checked in"
            />
          </div>
        </MetricCard>

        <MetricCard
          title="Present"
          value={chartData.present}
          description="Employees marked Present for this date"
          color={COLORS.green}
          icon="✓"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "17px",
            }}
          >
            <ProgressRing
              value={chartData.present}
              max={chartData.listed}
              color={COLORS.green}
              label="Present"
            />
          </div>
        </MetricCard>

        <MetricCard
          title="Late"
          value={chartData.late}
          description="Employees marked Late for this date"
          color={COLORS.orange}
          icon="◷"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "17px",
            }}
          >
            <ProgressRing
              value={chartData.late}
              max={chartData.listed}
              color={COLORS.orange}
              label="Late"
            />
          </div>
        </MetricCard>

        <MetricCard
          title="Combined working time"
          value={formatMinutes(totals.minutes)}
          description="Total recorded working time for this date"
          color={COLORS.purple}
          icon="◴"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "17px",
            }}
          >
            <ProgressRing
              value={totals.minutes}
              max={chartData.expectedMinutes}
              color={COLORS.purple}
              label="Of daily target"
            />
          </div>
        </MetricCard>
      </section>

      {/* Charts */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
          gap: "18px",
          marginBottom: "23px",
        }}
      >
        <div style={styles.panel}>
          <h2 style={{ margin: "0 0 6px", fontSize: "18px" }}>
            Attendance distribution
          </h2>

          <p
            style={{
              margin: "0 0 24px",
              color: COLORS.muted,
              fontSize: "13px",
            }}
          >
            Breakdown for the selected date
          </p>

          <AttendanceDonut
            present={chartData.present}
            late={chartData.late}
            notCheckedIn={chartData.notCheckedIn}
          />
        </div>

        <div style={styles.panel}>
          <h2 style={{ margin: "0 0 6px", fontSize: "18px" }}>
            Employee working hours
          </h2>

          <p
            style={{
              margin: "0 0 25px",
              color: COLORS.muted,
              fontSize: "13px",
            }}
          >
            Working time compared with the 8-hour daily target
          </p>

          {chartData.employees.length === 0 ? (
            <p style={styles.message}>
              No employees found for this date.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "19px" }}>
              {chartData.employees.slice(0, 8).map((employee, index) => {
                const percentage = Math.min(
                  100,
                  (employee.minutes / 480) * 100
                );

                const barColor =
                  employee.status === "Late"
                    ? COLORS.orange
                    : COLORS.blue;

                return (
                  <div key={`${employee.id || employee.name}-${index}`}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        marginBottom: "8px",
                        fontSize: "12px",
                      }}
                    >
                      <span
                        style={{
                          color: "#334155",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {employee.name}
                      </span>

                      <strong style={{ whiteSpace: "nowrap" }}>
                        {formatMinutes(employee.minutes)}
                      </strong>
                    </div>

                    <div
                      style={{
                        height: "10px",
                        background: "#edf1f7",
                        borderRadius: "99px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        className="ea-bar"
                        style={{
                          height: "100%",
                          width: `${percentage}%`,
                          background: barColor,
                          borderRadius: "99px",
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {chartData.employees.length > 8 && (
                <p
                  style={{
                    color: COLORS.muted,
                    fontSize: "12px",
                    margin: 0,
                  }}
                >
                  Showing 8 of {chartData.employees.length} employees.
                  Use search to find another employee.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Daily attendance table */}
      <section style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div>
            <h2 style={{ margin: 0, fontSize: "19px" }}>
              Daily attendance records
            </h2>

            <p
              style={{
                margin: "7px 0 0",
                color: COLORS.muted,
                fontSize: "13px",
              }}
            >
              Date: {date} · {filteredAttendance.length} employee(s)
            </p>
          </div>

          <span
            style={{
              padding: "7px 11px",
              borderRadius: "9px",
              background: "#f1f5f9",
              color: COLORS.muted,
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            {loading ? "Updating..." : "Daily report"}
          </span>
        </div>

        {loading ? (
          <div style={styles.message}>
            Loading attendance records...
          </div>
        ) : error ? (
          <div style={styles.message}>
            Attendance could not be loaded.
          </div>
        ) : filteredAttendance.length === 0 ? (
          <div style={styles.message}>
            No employees match this date or search.
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Employee</th>
                  <th style={styles.th}>Check-in</th>
                  <th style={styles.th}>Check-out</th>
                  <th style={styles.th}>Working hours</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Check-in distance</th>
                  <th style={styles.th}>Check-out distance</th>
                </tr>
              </thead>

              <tbody>
                {filteredAttendance.map((record) => {
                  const employee = record.employee || {};
                  const status = record.status || "Unmarked";
                  const badgeStyle = statusColor(status);

                  const workingHours =
                    record.checkIn && !record.checkOut
                      ? `${formatMinutes(record.workingMinutes)} (in progress)`
                      : formatMinutes(record.workingMinutes);

<>
  {/* Mobile attendance cards */}
  <div className="ea-mobile-records">
    {filteredAttendance.map((record) => {
      const employee = record.employee || {};
      const status = record.status || "Unmarked";
      const badgeStyle = statusColor(status);

      const workingHours =
        record.checkIn && !record.checkOut
          ? `${formatMinutes(record.workingMinutes)} (in progress)`
          : formatMinutes(record.workingMinutes);

      return (
        <article
          className="ea-mobile-card"
          key={`${employee._id || employee.email || "employee"}-${record.date}`}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>
                {employee.name || "Unknown employee"}
              </div>

              <div
                style={{
                  color: COLORS.muted,
                  fontSize: 12,
                  marginTop: 5,
                  overflowWrap: "anywhere",
                }}
              >
                {employee.email || ""}
              </div>
            </div>

            <span
              style={{
                padding: "6px 9px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 750,
                whiteSpace: "nowrap",
                ...badgeStyle,
              }}
            >
              {status}
            </span>
          </div>

          <div className="ea-mobile-card-grid">
            <div className="ea-mobile-field">
              <div className="ea-mobile-label">Check-in</div>
              <div className="ea-mobile-value">
                {formatTime(record.checkIn)}
              </div>
            </div>

            <div className="ea-mobile-field">
              <div className="ea-mobile-label">Check-out</div>
              <div className="ea-mobile-value">
                {formatTime(record.checkOut)}
              </div>
            </div>

            <div className="ea-mobile-field">
              <div className="ea-mobile-label">Working hours</div>
              <div className="ea-mobile-value">
                {record.checkIn ? workingHours : "—"}
              </div>
            </div>

            <div className="ea-mobile-field">
              <div className="ea-mobile-label">Check-in distance</div>
              <div className="ea-mobile-value">
                {formatDistance(record.checkInDistanceMeters)}
              </div>
            </div>

            <div className="ea-mobile-field">
              <div className="ea-mobile-label">Check-out distance</div>
              <div className="ea-mobile-value">
                {formatDistance(record.checkOutDistanceMeters)}
              </div>
            </div>
          </div>
        </article>
      );
    })}
  </div>

  {/* Desktop attendance table */}
  <div className="ea-desktop-table" style={styles.tableWrap}>
    {/* Keep your existing <table>, <thead>, and <tbody> here unchanged. */}
  </div>
</>

                  return (
                    <tr
                      className="ea-table-row"
                      key={`${employee._id || employee.email || "employee"}-${record.date}`}
                      style={{ transition: "background 150ms ease" }}
                    >
                      <td style={styles.td}>
                        <div style={{ fontWeight: 750 }}>
                          {employee.name || "Unknown employee"}
                        </div>

                        <div
                          style={{
                            color: COLORS.muted,
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {employee.email || ""}
                        </div>
                      </td>

                      <td style={styles.td}>
                        {formatTime(record.checkIn)}
                      </td>

                      <td style={styles.td}>
                        {formatTime(record.checkOut)}
                      </td>

                      <td
                        style={{
                          ...styles.td,
                          fontWeight: 700,
                        }}
                      >
                        {record.checkIn ? workingHours : "—"}
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 10px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 750,
                            ...badgeStyle,
                          }}
                        >
                          {status}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {formatDistance(record.checkInDistanceMeters)}
                      </td>

                      <td style={styles.td}>
                        {formatDistance(record.checkOutDistanceMeters)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}