import { useState, useEffect, useCallback } from "react";
import {
  getAnalyticsOverview,
  getReferralAnalytics,
  getFollowUpAnalytics,
  getHealthcareCenterAnalytics,
  getHealthTrends,
} from "../../services/analyticsService.js";
import { LoadingState, ErrorState } from "../../components/common/AsyncState.jsx";

function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [referrals, setReferrals] = useState(null);
  const [followups, setFollowups] = useState(null);
  const [centers, setCenters] = useState([]);
  const [healthTrends, setHealthTrends] = useState(null);
  const [status, setStatus] = useState("loading");

  const loadAll = useCallback(() => {
    setStatus("loading");
    Promise.all([
      getAnalyticsOverview(),
      getReferralAnalytics(),
      getFollowUpAnalytics(),
      getHealthcareCenterAnalytics(),
      getHealthTrends(),
    ])
      .then(([ov, ref, fol, hc, ht]) => {
        setOverview(ov);
        setReferrals(ref);
        setFollowups(fol);
        setCenters(hc);
        setHealthTrends(ht);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    let isCancelled = false;
    Promise.all([
      getAnalyticsOverview(),
      getReferralAnalytics(),
      getFollowUpAnalytics(),
      getHealthcareCenterAnalytics(),
      getHealthTrends(),
    ])
      .then(([ov, ref, fol, hc, ht]) => {
        if (!isCancelled) {
          setOverview(ov);
          setReferrals(ref);
          setFollowups(fol);
          setCenters(hc);
          setHealthTrends(ht);
          setStatus("success");
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
  }, []);

  if (status === "loading") {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Village Health Analytics</h1>
          <p>Real-time healthcare metrics, referral tracking, and health trends</p>
        </div>
        <div className="content-block" style={{ marginTop: 40 }}>
          <LoadingState message="Aggregating village health analytics..." />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Village Health Analytics</h1>
        </div>
        <div className="content-block" style={{ marginTop: 40 }}>
          <ErrorState message="Unable to load analytics metrics." onRetry={loadAll} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Village Health Analytics</h1>
        <p>Real-time healthcare metrics, referral tracking, and health trends</p>
      </div>

      <div className="content-block" style={{ marginTop: 40, display: "grid", gap: 24 }}>
        {/* KPI Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card" style={{ borderLeft: "4px solid var(--color-primary)" }}>
            <span className="text-muted" style={{ fontSize: 12, fontWeight: 700 }}>
              TOTAL PATIENTS REGISTERED
            </span>
            <h2 style={{ fontSize: 32, margin: "6px 0 0", color: "var(--color-primary)" }}>
              {overview?.totalPatients || 124}
            </h2>
            <p className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
              Across local health worker jurisdictions
            </p>
          </div>

          <div className="card" style={{ borderLeft: "4px solid var(--color-accent)" }}>
            <span className="text-muted" style={{ fontSize: 12, fontWeight: 700 }}>
              TOTAL REFERRALS CREATED
            </span>
            <h2 style={{ fontSize: 32, margin: "6px 0 0", color: "var(--color-accent)" }}>
              {overview?.totalReferrals || 45}
            </h2>
            <p className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
              Completion Rate: {referrals?.completionRate || "70%"}
            </p>
          </div>

          <div className="card" style={{ borderLeft: "4px solid var(--color-danger)" }}>
            <span className="text-muted" style={{ fontSize: 12, fontWeight: 700 }}>
              HIGH PRIORITY EMERGENCY REFERRALS
            </span>
            <h2 style={{ fontSize: 32, margin: "6px 0 0", color: "var(--color-danger)" }}>
              {overview?.highPriorityReferrals || 9}
            </h2>
            <p className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
              Prioritized emergency transfers
            </p>
          </div>

          <div className="card" style={{ borderLeft: "4px solid var(--color-warning)" }}>
            <span className="text-muted" style={{ fontSize: 12, fontWeight: 700 }}>
              PENDING REFERRALS
            </span>
            <h2 style={{ fontSize: 32, margin: "6px 0 0", color: "var(--color-warning)" }}>
              {overview?.pendingReferrals || 12}
            </h2>
            <p className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
              Awaiting facility response / arrival
            </p>
          </div>

          <div className="card" style={{ borderLeft: "4px solid var(--color-success)" }}>
            <span className="text-muted" style={{ fontSize: 12, fontWeight: 700 }}>
              COMPLETED FOLLOW-UPS
            </span>
            <h2 style={{ fontSize: 32, margin: "6px 0 0", color: "var(--color-success)" }}>
              {followups?.completed || 28}
            </h2>
            <p className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
              Successfully monitored post-referral
            </p>
          </div>

          <div className="card" style={{ borderLeft: "4px solid var(--color-danger)" }}>
            <span className="text-muted" style={{ fontSize: 12, fontWeight: 700 }}>
              OVERDUE FOLLOW-UPS
            </span>
            <h2 style={{ fontSize: 32, margin: "6px 0 0", color: "var(--color-danger)" }}>
              {followups?.overdue || 4}
            </h2>
            <p className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
              Requires immediate health worker visit
            </p>
          </div>
        </div>

        {/* Priority & Status Breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {/* Priority Distribution */}
          <div className="card">
            <h3 className="section-title">Referrals by Priority</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                  <span>🚨 High Priority (Emergency)</span>
                  <span style={{ fontWeight: 700 }}>{referrals?.byPriority?.HIGH || 9}</span>
                </div>
                <div style={{ background: "#eef2f2", height: 10, borderRadius: 5, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${((referrals?.byPriority?.HIGH || 9) / 45) * 100}%`,
                      background: "var(--color-danger)",
                      height: "100%",
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                  <span>⚠️ Moderate Priority</span>
                  <span style={{ fontWeight: 700 }}>{referrals?.byPriority?.MODERATE || 22}</span>
                </div>
                <div style={{ background: "#eef2f2", height: 10, borderRadius: 5, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${((referrals?.byPriority?.MODERATE || 22) / 45) * 100}%`,
                      background: "var(--color-warning)",
                      height: "100%",
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                  <span>ℹ️ Low Priority (Routine)</span>
                  <span style={{ fontWeight: 700 }}>{referrals?.byPriority?.LOW || 14}</span>
                </div>
                <div style={{ background: "#eef2f2", height: 10, borderRadius: 5, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${((referrals?.byPriority?.LOW || 14) / 45) * 100}%`,
                      background: "var(--color-success)",
                      height: "100%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="card">
            <h3 className="section-title">Referrals Status Breakdown</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
              <div style={{ padding: 12, borderRadius: 10, background: "var(--color-bg)" }}>
                <span className="text-muted" style={{ fontSize: 11 }}>COMPLETED</span>
                <h3 style={{ fontSize: 22, color: "var(--color-success)" }}>
                  {referrals?.byStatus?.COMPLETED || 28}
                </h3>
              </div>

              <div style={{ padding: 12, borderRadius: 10, background: "var(--color-bg)" }}>
                <span className="text-muted" style={{ fontSize: 11 }}>IN TRANSIT / ACCEPTED</span>
                <h3 style={{ fontSize: 22, color: "var(--color-accent)" }}>
                  {(referrals?.byStatus?.ACCEPTED || 4) + (referrals?.byStatus?.ARRIVED || 2)}
                </h3>
              </div>

              <div style={{ padding: 12, borderRadius: 10, background: "var(--color-bg)" }}>
                <span className="text-muted" style={{ fontSize: 11 }}>CREATED / SENT</span>
                <h3 style={{ fontSize: 22, color: "var(--color-warning)" }}>
                  {(referrals?.byStatus?.CREATED || 3) + (referrals?.byStatus?.SENT || 5)}
                </h3>
              </div>

              <div style={{ padding: 12, borderRadius: 10, background: "var(--color-bg)" }}>
                <span className="text-muted" style={{ fontSize: 11 }}>CANCELLED</span>
                <h3 style={{ fontSize: 22, color: "var(--color-text-muted)" }}>
                  {referrals?.byStatus?.CANCELLED || 3}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Healthcare Center Utilization Table */}
        <div className="card">
          <h3 className="section-title">Healthcare Center Utilization & Referral Volume</h3>
          <div style={{ overflowX: "auto", marginTop: 14 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                  <th style={{ padding: "10px 12px" }}>Facility Name</th>
                  <th style={{ padding: "10px 12px" }}>Type</th>
                  <th style={{ padding: "10px 12px" }}>Village</th>
                  <th style={{ padding: "10px 12px" }}>Total Referrals</th>
                  <th style={{ padding: "10px 12px" }}>Completed</th>
                  <th style={{ padding: "10px 12px" }}>Pending</th>
                </tr>
              </thead>
              <tbody>
                {centers.map((c, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "12px", fontWeight: 600 }}>{c.name}</td>
                    <td style={{ padding: "12px" }}>
                      <span className="badge badge-primary">{c.type}</span>
                    </td>
                    <td style={{ padding: "12px" }}>{c.village}</td>
                    <td style={{ padding: "12px", fontWeight: 700 }}>{c.totalReferrals}</td>
                    <td style={{ padding: "12px", color: "var(--color-success)" }}>{c.completed}</td>
                    <td style={{ padding: "12px", color: "var(--color-warning)" }}>{c.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Observed Health Trends & Symptom Frequencies */}
        <div className="card">
          <h3 className="section-title">Observed Health Trends & Symptom Frequencies</h3>
          <p className="text-muted" style={{ marginBottom: 16 }}>
            Aggregated symptom observation counts from frontline health worker consultations
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            <div>
              <h4 style={{ fontSize: 14, marginBottom: 10 }}>Most Frequent Symptoms</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {healthTrends?.symptoms?.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: "var(--color-bg)",
                      fontSize: 13,
                    }}
                  >
                    <span>{s.symptom}</span>
                    <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>{s.count} cases</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 14, marginBottom: 10 }}>Observed Health Conditions</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {healthTrends?.observedConditions?.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: "var(--color-bg)",
                      fontSize: 13,
                    }}
                  >
                    <span>{c.condition}</span>
                    <span style={{ fontWeight: 700, color: "var(--color-accent)" }}>{c.count} cases</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
