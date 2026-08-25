import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout.jsx";
import HealthcareCentersPage from "./pages/healthcare/HealthcareCentersPage.jsx";
import ReferralsPage from "./pages/referrals/ReferralsPage.jsx";
import ReferralDetailPage from "./pages/referrals/ReferralDetailPage.jsx";
import CreateReferralPage from "./pages/referrals/CreateReferralPage.jsx";
import FollowUpsPage from "./pages/followups/FollowUpsPage.jsx";
import AnalyticsPage from "./pages/analytics/AnalyticsPage.jsx";
import ConsultationPage from "./pages/ConsultationPage";
import RiskAssessmentPage from "./pages/RiskAssessmentPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/healthcare-centers" replace />} />
        <Route path="/healthcare-centers" element={<HealthcareCentersPage />} />

        <Route path="/referrals" element={<ReferralsPage />} />
        <Route path="/referrals/new" element={<CreateReferralPage />} />
        <Route path="/referrals/:id" element={<ReferralDetailPage />} />

        <Route path="/follow-ups" element={<FollowUpsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />

        <Route path="/consultation/:patientId" element={<ConsultationPage />} />
        <Route path="/risk-assessment/:patientId" element={<RiskAssessmentPage />} />

        <Route path="*" element={<Navigate to="/healthcare-centers" replace />} />
      </Route>
    </Routes>
  );
}

export default App;