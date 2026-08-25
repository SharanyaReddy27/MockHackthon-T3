import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getReferrals } from "../../services/referralService.js";
import ReferralCard from "./ReferralCard.jsx";
import ReferralFilters from "./ReferralFilters.jsx";
import { LoadingState, EmptyState, ErrorState } from "../../components/common/AsyncState.jsx";

function ReferralsPage() {
  const [referrals, setReferrals] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ urgency: "", status: "" });
  const [status, setStatus] = useState("loading"); // loading | success | error

  const fetchReferrals = useCallback(() => {
    setStatus("loading");
    getReferrals({ search, ...filters })
      .then((data) => {
        setReferrals(data);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [search, filters]);

  useEffect(() => {
    let isCancelled = false;
    getReferrals({ search, ...filters })
      .then((data) => {
        if (!isCancelled) {
          setReferrals(data);
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
  }, [search, filters]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Referrals</h1>
        <p>Create, view and track patient referrals to healthcare centers</p>
      </div>

      <div className="content-block" style={{ marginTop: 40 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            className="input"
            placeholder="Search by patient, reason or facility..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 420 }}
          />
          <Link to="/referrals/new" className="btn btn-primary" style={{ marginLeft: "auto" }}>
            + New Referral
          </Link>
        </div>

        <ReferralFilters filters={filters} onChange={setFilters} />

        {status === "loading" && <LoadingState message="Loading referrals..." />}
        {status === "error" && <ErrorState message="Unable to load referrals." onRetry={fetchReferrals} />}
        {status === "success" && referrals.length === 0 && (
          <EmptyState title="No referrals found" subtitle="Try changing your search or filters." />
        )}
        {status === "success" && referrals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ marginTop: 16 }}>
            {referrals.map((r) => (
              <ReferralCard key={r.id} referral={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReferralsPage;