import { useState, useEffect, useCallback } from "react";
import { getHealthcareCenters } from "../../services/healthcareCenterService.js";
import { LoadingState, EmptyState, ErrorState } from "../../components/common/AsyncState.jsx";

const TYPES = ["All", "PHC", "Community Health Center", "Hospital", "Clinic"];

function HealthcareCentersPage() {
  const [centers, setCenters] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [status, setStatus] = useState("loading");

  const load = useCallback(() => {
    setStatus("loading");
    getHealthcareCenters({
      search,
      type: typeFilter === "All" ? "" : typeFilter,
      emergencyOnly,
    })
      .then((data) => {
        setCenters(data);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [search, typeFilter, emergencyOnly]);

  useEffect(() => {
    let isCancelled = false;
    getHealthcareCenters({
      search,
      type: typeFilter === "All" ? "" : typeFilter,
      emergencyOnly,
    })
      .then((data) => {
        if (!isCancelled) {
          setCenters(data);
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
  }, [search, typeFilter, emergencyOnly]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Healthcare Centers Discovery</h1>
        <p>Locate nearby primary health centers, community hospitals, and emergency facilities</p>
      </div>

      <div className="content-block" style={{ marginTop: 40 }}>
        {/* Search and Filters Bar */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input
            className="input"
            placeholder="Search by facility name, village, or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 440 }}
          />

          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
          gap: 8,
          fontSize: 14,
          cursor: "pointer",
          marginLeft: "auto",
          fontWeight: 600,
            }}
          >
          <input
            type="checkbox"
            checked={emergencyOnly}
            onChange={(e) => setEmergencyOnly(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: "var(--color-danger)" }}
          />
          🚨 24/7 Emergency Support Only
        </label>
      </div>

      {/* Type Filter Chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
        {TYPES.map((t) => (
          <button
            key={t}
            className={`chip ${typeFilter === t ? "active" : ""}`}
            onClick={() => setTypeFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Async Content Rendering */}
      {status === "loading" && <LoadingState message="Discovering nearby healthcare centers..." />}
      {status === "error" && (
        <ErrorState message="Unable to fetch healthcare centers." onRetry={load} />
      )}
      {status === "success" && centers.length === 0 && (
        <EmptyState title="No facilities found" subtitle="Try adjusting your search query or filters." />
      )}
      {status === "success" && centers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ marginTop: 20 }}>
          {centers.map((c) => (
            <div key={c.id} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <h3 style={{ fontSize: 17, margin: 0 }}>{c.name}</h3>
                  <p className="text-muted" style={{ marginTop: 2 }}>
                    📍 {c.village}, {c.district} • {c.distance} km away
                  </p>
                </div>
                <span className="badge badge-primary">{c.type}</span>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {c.emergencySupport && (
                  <span className="badge badge-danger">🚨 24/7 Emergency Care</span>
                )}
                <span className="badge badge-success">🛏️ {c.availableBeds} Beds Available</span>
              </div>

              <div>
                <p className="text-muted" style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  SERVICES OFFERED
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {c.services.map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 6,
                        background: "var(--color-accent-light)",
                        color: "var(--color-primary-dark)",
                        fontWeight: 500,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "auto", paddingTop: 10, borderTop: "1px solid var(--color-border)" }}>
                <a
                  href={`tel:${c.phone}`}
                  className="btn btn-outline btn-block"
                  style={{ fontSize: 13, textDecoration: "none" }}
                >
                  📞 Call Facility ({c.phone})
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div >
  );
}

export default HealthcareCentersPage;
