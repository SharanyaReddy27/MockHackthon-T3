import { Routes, Route, Navigate } from "react-router-dom";

import ConsultationPage from "./pages/ConsultationPage";
import RiskAssessmentPage from "./pages/RiskAssessmentPage";

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={
          <Navigate
            to="/consultation/P1024"
            replace
          />
        }
      />

      <Route
        path="/consultation/:patientId"
        element={<ConsultationPage />}
      />

      <Route
        path="/risk-assessment/:patientId"
        element={<RiskAssessmentPage />}
      />

    </Routes>
  );
}

export default App;