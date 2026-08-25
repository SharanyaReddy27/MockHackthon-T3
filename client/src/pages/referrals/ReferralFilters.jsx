import { URGENCY_LEVELS, REFERRAL_STATUSES } from "../../data/mockReferrals.js";

function ReferralFilters({ filters, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
      <span className="text-muted" style={{ alignSelf: "center", marginRight: 4 }}>
        Urgency:
      </span>
      <button
        className={`chip ${!filters.urgency ? "active" : ""}`}
        onClick={() => onChange({ ...filters, urgency: "" })}
      >
        All
      </button>
      {URGENCY_LEVELS.map((level) => (
        <button
          key={level}
          className={`chip ${filters.urgency === level ? "active" : ""}`}
          onClick={() => onChange({ ...filters, urgency: level })}
        >
          {level}
        </button>
      ))}

      <span className="text-muted" style={{ alignSelf: "center", margin: "0 4px 0 12px" }}>
        Status:
      </span>
      <button
        className={`chip ${!filters.status ? "active" : ""}`}
        onClick={() => onChange({ ...filters, status: "" })}
      >
        All
      </button>
      {REFERRAL_STATUSES.map((status) => (
        <button
          key={status}
          className={`chip ${filters.status === status ? "active" : ""}`}
          onClick={() => onChange({ ...filters, status })}
        >
          {status}
        </button>
      ))}
    </div>
  );
}

export default ReferralFilters;