function LoadingState({ message = "Loading..." }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ marginTop: 16 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="card">
          <div className="skeleton" style={{ height: 18, width: "70%", marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 14, width: "40%", marginBottom: 14 }} />
          <div className="skeleton" style={{ height: 14, width: "90%", marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 14, width: "60%" }} />
        </div>
      ))}
      <span className="text-muted" style={{ gridColumn: "1 / -1" }}>{message}</span>
    </div>
  );
}

function EmptyState({ title = "Nothing here yet", subtitle = "Try changing your search or filters." }) {
  return (
    <div className="empty-state card">
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
  );
}

function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="error-state card">
      <h3>Unable to load data</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

export { LoadingState, EmptyState, ErrorState };