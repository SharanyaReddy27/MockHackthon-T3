import { useState, useEffect, useCallback } from "react";
import { getFollowUps, updateFollowUpStatus } from "../../services/followUpService.js";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { LoadingState, EmptyState, ErrorState } from "../../components/common/AsyncState.jsx";

const STATUS_TABS = [
  { id: "ALL", label: "All Follow-ups" },
  { id: "UPCOMING", label: "Upcoming" },
  { id: "OVERDUE", label: "⚠️ Overdue" },
  { id: "COMPLETED", label: "Completed" },
];

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function FollowUpsPage() {
  const [followUps, setFollowUps] = useState([]);
  const [tab, setTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading");
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(() => {
    setStatus("loading");
    getFollowUps({
      status: tab === "ALL" ? "" : tab,
      search,
    })
      .then((data) => {
        setFollowUps(data);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [tab, search]);

  useEffect(() => {
    let isCancelled = false;
    getFollowUps({
      status: tab === "ALL" ? "" : tab,
      search,
    })
      .then((data) => {
        if (!isCancelled) {
          setFollowUps(data);
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
  }, [tab, search]);

  const handleMarkComplete = async (id) => {
    setUpdatingId(id);
    await updateFollowUpStatus(id, "COMPLETED");
    setFollowUps((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "COMPLETED", isOverdue: false } : f))
    );
    setUpdatingId(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Patient Follow-ups & Reminders</h1>
        <p>Schedule, track, and complete post-referral and consultation follow-ups</p>
      </div>

      <div className="content-block" style={{ marginTop: 40 }}>
        {/* Search & Tabs */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input
            className="input"
            placeholder="Search by patient name, village, or note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 440 }}
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: "auto" }}>
            {STATUS_TABS.map((t) => (
              <button
                key={t.id}
                className={`chip ${tab === t.id ? "active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content States */}
        {status === "loading" && <LoadingState message="Loading patient follow-ups..." />}
        {status === "error" && <ErrorState message="Unable to load follow-ups." onRetry={load} />}
        {status === "success" && followUps.length === 0 && (
          <EmptyState title="No follow-ups found" subtitle="All clear! No follow-ups match your criteria." />
        )}
        {status === "success" && followUps.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ marginTop: 20 }}>
            {followUps.map((item) => {
              const isOverdue = item.isOverdue && item.status !== "COMPLETED";
              return (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    borderColor: isOverdue ? "var(--color-danger)" : "var(--color-border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h3 style={{ fontSize: 16, margin: 0 }}>{item.patientName}</h3>
                      <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>
                        {item.patientAge} yrs • {item.village}
                      </p>
                    </div>
                    {isOverdue ? (
                      <span className="badge badge-danger">⚠️ OVERDUE</span>
                    ) : (
                      <StatusBadge
                        status={item.status === "COMPLETED" ? "completed" : "pending"}
                        label={item.status}
                      />
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span className="badge badge-primary">⏰ {item.type}</span>
                    <span className="badge badge-neutral">Scheduled: {formatDate(item.scheduledDate)}</span>
                  </div>

                  <p style={{ fontSize: 14, margin: "6px 0", color: "var(--color-text)" }}>{item.notes}</p>

                  <div style={{ marginTop: "auto", paddingTop: 10, borderTop: "1px solid var(--color-border)" }}>
                    {item.status === "COMPLETED" ? (
                      <span className="text-muted" style={{ fontSize: 12 }}>
                        ✓ Follow-up Completed
                      </span>
                    ) : (
                      <button
                        className="btn btn-primary btn-block"
                        disabled={updatingId === item.id}
                        onClick={() => handleMarkComplete(item.id)}
                        style={{ fontSize: 13 }}
                      >
                        {updatingId === item.id ? "Updating..." : "✓ Mark as Completed"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default FollowUpsPage;
