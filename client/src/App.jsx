import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout.jsx";
import HealthcareCentersPage from "./pages/healthcare/HealthcareCentersPage.jsx";
import ReferralsPage from "./pages/referrals/ReferralsPage.jsx";
import ReferralDetailPage from "./pages/referrals/ReferralDetailPage.jsx";
import CreateReferralPage from "./pages/referrals/CreateReferralPage.jsx";
import FollowUpsPage from "./pages/followups/FollowUpsPage.jsx";
import AnalyticsPage from "./pages/analytics/AnalyticsPage.jsx";
import ConsultationPage from "./pages/ConsultationPage";

// New Pages
import LandingPage from "./pages/LandingPage";
import HealthWorkerEntryPage from "./pages/healthworker/HealthWorkerEntryPage";
import HealthWorkerLoginPage from "./pages/healthworker/HealthWorkerLoginPage";
import HealthWorkerRegisterPage from "./pages/healthworker/HealthWorkerRegisterPage";
import HealthWorkerDashboard from "./pages/healthworker/HealthWorkerDashboard";
import PatientLoginPage from "./pages/patient/PatientLoginPage";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientsPage from "./pages/patients/PatientsPage";
import RegisterPatientPage from "./pages/patients/RegisterPatientPage";
import PatientProfilePage from "./pages/patients/PatientProfilePage";

import "./App.css";

function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/health-worker" element={<HealthWorkerEntryPage />} />
      <Route path="/health-worker/login" element={<HealthWorkerLoginPage />} />
      <Route path="/health-worker/register" element={<HealthWorkerRegisterPage />} />
      <Route path="/patient/login" element={<PatientLoginPage />} />

      {/* PATIENT PORTAL ROUTES (Self-contained Layout inside PatientDashboard) */}
      <Route path="/patient/dashboard" element={<PatientDashboard />} />
      <Route path="/patient/health-record" element={<PatientDashboard />} />
      <Route path="/patient/consultations" element={<PatientDashboard />} />
      <Route path="/patient/medications" element={<PatientDashboard />} />
      <Route path="/patient/referrals" element={<PatientDashboard />} />
      <Route path="/patient/follow-ups" element={<PatientDashboard />} />
      <Route path="/patient/profile" element={<PatientDashboard />} />

      {/* HEALTH WORKER APP ROUTES (Using AppLayout) */}
      <Route element={<AppLayout />}>
        <Route path="/health-worker/dashboard" element={<HealthWorkerDashboard />} />
        
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/register" element={<RegisterPatientPage />} />
        <Route path="/patients/:patientId" element={<PatientProfilePage />} />

        <Route path="/consultation" element={<ConsultationPage />} />
        <Route path="/consultation/:patientId" element={<ConsultationPage />} />

        <Route path="/healthcare-centers" element={<HealthcareCentersPage />} />
        <Route path="/referrals" element={<ReferralsPage />} />
        <Route path="/referrals/new" element={<CreateReferralPage />} />
        <Route path="/referrals/:id" element={<ReferralDetailPage />} />

        <Route path="/follow-ups" element={<FollowUpsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;