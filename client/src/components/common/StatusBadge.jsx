function StatusBadge({ status, label }) {
  const toneMap = {
    low: "badge-success",
    moderate: "badge-warning",
    high: "badge-danger",
    pending: "badge-warning",
    "in-progress": "badge-primary",
    completed: "badge-success",
    cancelled: "badge-neutral",
    available: "badge-success",
    unavailable: "badge-neutral",
    overdue: "badge-danger",
    upcoming: "badge-primary",
    done: "badge-success",
  };

  const toneClass = toneMap[status] || "badge-neutral";

  return <span className={`badge ${toneClass}`}>{label}</span>;
}

export default StatusBadge;