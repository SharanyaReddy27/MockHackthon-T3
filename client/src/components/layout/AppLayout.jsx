import { NavLink, Outlet } from "react-router-dom";
import "./AppLayout.css";

const NAV_ITEMS = [
  { to: "/healthcare-centers", label: "Healthcare Centers", icon: "🏥" },
  { to: "/referrals", label: "Referrals", icon: "📋" },
  { to: "/follow-ups", label: "Follow-ups", icon: "⏰" },
  { to: "/analytics", label: "Analytics", icon: "📊" },
];

function AppLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <span className="topbar-logo">VH</span>
          <span className="topbar-title">Village Health Access</span>
        </div>
        <nav className="topbar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                "topbar-nav-link" + (isActive ? " active" : "")
              }
            >
              <span className="topbar-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              "bottom-nav-link" + (isActive ? " active" : "")
            }
          >
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default AppLayout;