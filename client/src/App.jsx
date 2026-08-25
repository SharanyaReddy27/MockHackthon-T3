import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout.jsx";
import HealthcareCentersPlaceholderPage from "./pages/healthcare/HealthcareCentersPlaceholderPage.jsx";
import ReferralsPage from "./pages/referrals/ReferralsPage.jsx";
import ReferralDetailPage from "./pages/referrals/ReferralDetailPage.jsx";
import CreateReferralPage from "./pages/referrals/CreateReferralPage.jsx";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/healthcare-centers" replace />} />
        <Route path="/healthcare-centers" element={<HealthcareCentersPlaceholderPage />} />

        <Route path="/referrals" element={<ReferralsPage />} />
        <Route path="/referrals/new" element={<CreateReferralPage />} />
        <Route path="/referrals/:id" element={<ReferralDetailPage />} />

        {/* Follow-up and Analytics routes are added in the next steps */}

        <Route path="*" element={<Navigate to="/healthcare-centers" replace />} />
      </Route>
    </Routes>
  );
}

export default App;