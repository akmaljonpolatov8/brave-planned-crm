import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { canManage, isOwner } from "../../lib/permissions";

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    ["/", "Dashboard"],
    ["/students", "O'quvchilar"],
    ["/teachers", "O'qituvchilar"],
    ["/groups", "Guruhlar"],
    ...(isOwner(user) ? [["/import", "Excel import"]] : []),
    ["/attendance", "Davomat"],
    ["/payments", "To'lovlar"],
    ["/debtors", "Qarzdorlar"],
    ["/sms", "SMS"],
  ].filter(([path]) => canManage(user) || ["/", "/attendance"].includes(path));

  return (
    <aside className="sidebar">
      <div className="sidebar-title">Brave & Planet</div>
      <div className="sidebar-subtitle">Ta'lim markazi CRM</div>
      <nav className="sidebar-nav">
        {links.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div style={{ marginTop: 24 }}>
        <button
          className="btn-secondary"
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
        >
          Chiqish
        </button>
      </div>
    </aside>
  );
}
