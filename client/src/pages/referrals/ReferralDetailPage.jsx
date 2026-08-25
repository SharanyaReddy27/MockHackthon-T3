import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getReferralById, updateReferralStatus } from "../../services/referralService.js";
import { REFERRAL_STATUSES } from "../../data/mockReferrals.js";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { LoadingState, ErrorState } from "../../components/common/AsyncState.jsx";

const URGENCY_STATUS_KEY = { Low: "low", Moderate: "moderate", High: "high" };
const REFERRAL_STATUS_KEY = {
  Pending: "pending",
  Accepted: "in-progress",
  "In Transit": "in-progress",
  Arrived: "in-progress",
  Completed: "completed",
  Cancelled: "cancelled",
};

function ReferralDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [referral, setReferral] = useState(null);
  const [status, setStatus] = useState("loading");
  const [updating, setUpdating] = useState(false);

  const fetchReferral = useCallback(() => {
    setStatus("loading");
    getReferralById(id)
      .then((data) => {
        setReferral(data);
        setStatus(data ? "success" : "not-found");
      })
      .catch(() => setStatus("error"));
  }, [id]);

  useEffect(() => {
    let isCancelled = false;
    getReferralById(id)
      .then((data) => {
        if (!isCancelled) {
          setReferral(data);
          setStatus(data ? "success" : "not-found");
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setStatus("error");
        }
      });
    return () => {
      isCancelled = true;
    };
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    const updated = await updateReferralStatus(id, newStatus);
    setReferral(updated);
    setUpdating(false);
  };

  if (status === "loading") {
    return (
      <div className="page">
        <LoadingState message="Loading referral..." />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page">
        <ErrorState message="Unable to load this referral." onRetry={fetchReferral} />
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div className="page">
        <div className="empty-state card">
          <h3>Referral not found</h3>
          <p>This referral may have been removed.</p>
          <Link to="/referrals" className="btn btn-primary" style={{ marginTop: 14 }}>
            Back to Referrals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", marginBottom: 8, fontSize: 13 }}
        >
          ← Back
        </button>
        <h1>{referral.patientName}</h1>
        <p>
          {referral.id} • {referral.patientAge} yrs • {referral.patientGender} • {referral.village}
        </p>
      </div>

      <div className="content-block" style={{ marginTop: 40, display: "grid", gap: 16 }}>
        <div className="card" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <StatusBadge status={URGENCY_STATUS_KEY[referral.urgency]} label={`${referral.urgency} Urgency`} />
          <StatusBadge status={REFERRAL_STATUS_KEY[referral.status]} label={referral.status} />
          <span className="text-muted" style={{ marginLeft: "auto" }}>
            Created {new Date(referral.createdAt).toLocaleString()}
          </span>
        </div>

        <div className="card">
          <h3 className="section-title">Reason for Referral</h3>
          <p>{referral.reason}</p>
        </div>

        <div className="card">
          <h3 className="section-title">Referred Facility</h3>
          <p style={{ fontWeight: 600 }}>{referral.healthcareCenter.name}</p>
          <p className="text-muted">{referral.healthcareCenter.type}</p>
        </div>

        <div className="card">
          <h3 className="section-title">Notes</h3>
          <p>{referral.notes || "No additional notes."}</p>
          <p className="text-muted" style={{ marginTop: 10 }}>Created by {referral.createdBy}</p>
        </div>

        <div className="card">
          <h3 className="section-title">Update Referral Status</h3>
          <p className="text-muted" style={{ marginBottom: 12 }}>
            Track the referral from creation through patient arrival and completion.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {REFERRAL_STATUSES.map((s) => (
              <button
                key={s}
                disabled={updating || referral.status === s}
                onClick={() => handleStatusChange(s)}
                className={`chip ${referral.status === s ? "active" : ""}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReferralDetailPage;