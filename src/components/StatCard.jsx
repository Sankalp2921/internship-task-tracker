import React from "react";

function StatCard({
  title,
  value,
  icon,
  onClick
}) {

  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
      }}
    >

      <div>
        <p>{title}</p>

        <h2>
          {value}
        </h2>
      </div>

      <span className="stat-icon">
        {icon}
      </span>

    </div>
  );
}

export default StatCard;