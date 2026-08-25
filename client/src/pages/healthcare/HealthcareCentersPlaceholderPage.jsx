function HealthcareCentersPlaceholderPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Healthcare Centers</h1>
        <p>Discovery and profile module (built separately)</p>
      </div>
      <div className="content-block" style={{ marginTop: 40 }}>
        <div className="card">
          <p className="text-muted">
            This module is owned and implemented independently (Healthcare Center
            Discovery & Profile). It is referenced here only so referral creation
            can link a patient to a selected center.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HealthcareCentersPlaceholderPage;