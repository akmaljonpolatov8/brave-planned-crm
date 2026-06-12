import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X } from "lucide-react";

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

function SidebarContent({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={{
      width: '280px',
      height: '100vh',
      background: '#1a0f2e',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 0',
      overflowY: 'auto',
    }}>
      {/* Logo + Close */}
      <div style={{ padding: '0 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#FFD662', fontWeight: 700, fontSize: '18px' }}>Brave & Planet</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' }}>Ta'lim markazi CRM</div>
        </div>
        <button onClick={onClose} aria-label="Yopish" style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
          <X size={22} />
        </button>
      </div>

      {/* User info */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ background: 'rgba(255,214,98,0.08)', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#FFD662', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a0f2e', fontSize: '14px', fontWeight: 700 }}>
            {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
          <div>
            <div style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>{user?.full_name || user?.username}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 10px' }}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'block',
              padding: '13px 18px',
              borderRadius: '10px',
              fontSize: '15px',
              textDecoration: 'none',
              marginBottom: '3px',
              fontWeight: isActive ? 600 : 400,
              background: isActive ? '#FFD662' : 'transparent',
              color: isActive ? '#1a0f2e' : 'rgba(255,255,255,0.7)',
              transition: 'all 0.15s',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Chiqish */}
      <div style={{ padding: '12px 10px 0' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            fontSize: '14px',
            background: 'rgba(220,38,38,0.12)',
            color: '#f87171',
            border: '1px solid rgba(220,38,38,0.2)',
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#2d1b4e' }}>
      {/* Sidebar Overlay — always via hamburger */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }}>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Top Header — always visible */}
      <header style={{
        background: '#1a0f2e',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,214,98,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Menyu"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Menu size={20} />
          </button>
          <div style={{ color: '#FFD662', fontSize: '16px', fontWeight: 700 }}>Brave & Planet</div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
          {user?.role}
        </div>
      </header>

      {/* Page Content — full width */}
      <main style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
