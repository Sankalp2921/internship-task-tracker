import React from "react";

function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">

      <div>
        <p>{title}</p>
        <h2>{value}</h2>
      </div>

      <span className="stat-icon">
        {icon}
      </span>

    </div>
  );
}

export default StatCard;