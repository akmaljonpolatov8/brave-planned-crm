import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X } from "lucide-react";

const months = ['YAN','FEV','MAR','APR','MAY','IYN','IYL','AVG','SEP','OKT','NOY','DEK'];
const dayNames = ['Yak','Du','Se','Chor','Pay','Jum','Shan'];

function formatDate() {
  const now = new Date();
  return `${now.getFullYear()} M${months[now.getMonth()]}${now.getDate().toString().padStart(2,'0')}, ${dayNames[now.getDay()]}`;
}

const navItems = [
  { path: "/", label: "Dashboard" },
  { path: "/students", label: "O'quvchilar" },
  { path: "/teachers", label: "O'qituvchilar" },
  { path: "/groups", label: "Guruhlar" },
  { path: "/import", label: "Excel import" },
  { path: "/attendance", label: "Davomat" },
  { path: "/payments", label: "To'lovlar" },
  { path: "/debtors", label: "Qarzdorlar" },
  { path: "/sms", label: "SMS" },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={{
      width: '260px',
      height: '100vh',
      background: '#1a0f2e',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '20px' }}>Brave & Planet</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '2px' }}>Ta'lim markazi CRM</div>
          </div>
          {onClose && (
            <button onClick={onClose} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 12px' }}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'block',
              padding: '12px 20px',
              borderRadius: '10px',
              fontSize: '15px',
              textDecoration: 'none',
              marginBottom: '2px',
              fontWeight: isActive ? 600 : 400,
              background: isActive ? '#FFD662' : 'transparent',
              color: isActive ? '#2d1b4e' : 'rgba(255,255,255,0.7)',
              transition: 'all 0.15s',
            })}
            className="nav-link-hover"
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Chiqish button */}
      <div style={{ padding: '0 12px' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            fontSize: '15px',
            background: '#7c1d1d',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Chiqish
        </button>
      </div>
    </div>
  );
}

export function AppLayout() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#2d1b4e' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden" style={{ position: 'fixed', inset: 0, zIndex: 999 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} onClick={() => setMobileOpen(false)} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header style={{
          background: '#1a0f2e',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,214,98,0.1)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <Menu size={24} />
            </button>
            <div>
              <div style={{ color: '#FFD662', fontSize: '20px', fontWeight: 700 }}>Brave and Planet CRM</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '2px', textTransform: 'capitalize' }}>
                {user?.role} · {user?.username}
              </div>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
            {formatDate()}
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
