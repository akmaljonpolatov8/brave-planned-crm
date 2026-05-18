import { Outlet } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children?: ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-shell">
        <div className="topbar">
          <div>
            <h2>Brave and Planet CRM</h2>
            <div className="topbar-meta">
              {user?.full_name} · {user?.role}
            </div>
          </div>
          <div className="topbar-meta">
            {new Intl.DateTimeFormat("uz-UZ", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            }).format(new Date())}
          </div>
        </div>
        {children || <Outlet />}
      </main>
    </div>
  );
}
