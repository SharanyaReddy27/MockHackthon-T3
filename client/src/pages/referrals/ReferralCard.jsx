import { Link } from "react-router-dom";
import StatusBadge from "../../components/common/StatusBadge.jsx";

const URGENCY_STATUS_KEY = { Low: "low", Moderate: "moderate", High: "high" };
const REFERRAL_STATUS_KEY = {
  Pending: "pending",
  Accepted: "in-progress",
  "In Transit": "in-progress",
  Arrived: "in-progress",
  Completed: "completed",
  Cancelled: "cancelled",
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ReferralCard({ referral }) {
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <h3 style={{ fontSize: 16 }}>{referral.patientName}</h3>
          <p className="text-muted">
            {referral.patientAge} yrs • {referral.patientGender} • {referral.village}
          </p>
        </div>
        <StatusBadge status={URGENCY_STATUS_KEY[referral.urgency]} label={referral.urgency} />
      </div>

      <p style={{ margin: "12px 0", fontSize: 14 }}>{referral.reason}</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        <span className="chip">📍 {referral.healthcareCenter.name}</span>
        <span className="chip">{referral.healthcareCenter.type}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <StatusBadge status={REFERRAL_STATUS_KEY[referral.status]} label={referral.status} />
        <span className="text-muted">{formatDate(referral.createdAt)}</span>
      </div>

      <Link to={`/referrals/${referral.id}`} className="btn btn-primary btn-block" style={{ marginTop: 14 }}>
        View Referral
      </Link>
    </div>
  );
}

export default ReferralCard;