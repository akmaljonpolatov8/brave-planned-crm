import { LogOut, Menu, Search } from "lucide-react";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const runSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await api.get("/search", { params: { q: query } });
    navigate("/students", { state: { searchResults: response.data, searchQuery: query } });
  };

  return (
    <div className="min-h-screen bg-[#031B1B] text-white">
      <Sidebar />
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#031B1B]/95 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <button
                className="btn-secondary lg:hidden"
                onClick={() => setMobileOpen((value) => !value)}
                aria-label="Menuni ochish"
              >
                <Menu size={18} />
              </button>
              <div>
                <div className="text-sm text-white/50">Rol</div>
                <div className="font-semibold uppercase">{user?.role}</div>
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <form className="relative" onSubmit={runSearch}>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                  size={18}
                />
                <input
                  className="input w-full pl-10 lg:w-80"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Global qidiruv"
                  aria-label="Global qidiruv"
                />
              </form>
              <button
                className="btn-secondary"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <LogOut size={16} />
                Chiqish
              </button>
            </div>
          </div>
          {mobileOpen ? (
            <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4 lg:hidden">
              <Sidebar />
            </div>
          ) : null}
        </header>
        <main className="px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
