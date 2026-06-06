import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

type DashboardData = {
  topStats?: {
    students?: number;
    groups?: number;
    teachers?: number;
    revenue?: number | null;
    unpaid?: number;
    studentsDelta?: number;
  };
  lastPayments?: Array<{
    full_name: string;
    group_name?: string | null;
    amount: number;
    paid: number;
  }>;
  groupStatus?: Array<{
    id: number;
    name: string;
    total?: number;
    present_today?: number;
  }>;
  todayLessons?: Array<{
    id?: number;
    name: string;
    time?: string | null;
    marked?: boolean;
    status?: string;
  }>;
};

function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return n.toLocaleString();
}

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/dashboard");
      setData(response.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const isOwner = user?.role === 'owner';
  const stats = data?.topStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--gold)]">Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--text-muted)]">{user?.role}</span>
          <div className="h-8 w-8 rounded-full bg-[var(--bg-card2)] flex items-center justify-center text-xs font-bold text-[var(--gold)]">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      {!loading && (
        <div className="stats-grid">
          <div className="stat-card bp-fadeup bp-delay-0">
            <p className="stat-title">Jami o'quvchilar</p>
            <p className="stat-value" style={{ color: '#FFD662' }}>{stats?.students ?? 0}</p>
            <p className="stat-sub">+{stats?.studentsDelta ?? 0} bu oy</p>
          </div>
          <div className="stat-card bp-fadeup bp-delay-1">
            <p className="stat-title">Faol guruhlar</p>
            <p className="stat-value" style={{ color: '#a78bfa' }}>{stats?.groups ?? 0}</p>
            <p className="stat-sub">{stats?.teachers ?? 0} ta o'qituvchi</p>
          </div>
          {isOwner && (
            <div className="stat-card bp-fadeup bp-delay-2">
              <p className="stat-title">Daromad (oy)</p>
              <p className="stat-value" style={{ color: '#4ade80' }}>{formatNumber(stats?.revenue ?? 0)}</p>
              <p className="stat-sub">so'm</p>
            </div>
          )}
          <div className="stat-card bp-fadeup bp-delay-3">
            <p className="stat-title">Qarzdorlar</p>
            <p className="stat-value" style={{ color: '#f87171' }}>{stats?.unpaid ?? 0}</p>
            <p className="stat-sub">15-dan keyin</p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="stats-grid">
          {[1,2,3,4].map(i => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-3 w-24 rounded bg-white/10 mb-4" />
              <div className="h-10 w-16 rounded bg-white/10 mb-3" />
              <div className="h-3 w-20 rounded bg-white/10" />
            </div>
          ))}
        </div>
      )}

      {/* Oxirgi to'lovlar */}
      {!loading && (
        <div className="bp-panel p-0 overflow-hidden bp-fadeup bp-delay-4">
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-base font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Oxirgi to'lovlar
            </h2>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                <th className="bp-th">O'quvchi</th>
                <th className="bp-th">Guruh</th>
                <th className="bp-th">Summa</th>
                <th className="bp-th">Holat</th>
              </tr>
            </thead>
            <tbody>
              {(data?.lastPayments || []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="bp-td text-center" style={{ color: 'var(--text-muted)' }}>
                    Hozircha to'lovlar yo'q
                  </td>
                </tr>
              ) : (
                (data?.lastPayments || []).map((p, i) => (
                  <tr key={i} style={{ borderTop: '1px solid rgba(255,214,98,0.06)' }}>
                    <td className="bp-td font-medium">{p.full_name}</td>
                    <td className="bp-td" style={{ color: 'var(--text-muted)' }}>{p.group_name || '—'}</td>
                    <td className="bp-td">{(p.amount || 0).toLocaleString()}</td>
                    <td className="bp-td">
                      <span className={`bp-badge ${p.paid ? 'bp-badge-tolangan' : 'bp-badge-qarzdor'}`}>
                        {p.paid ? "To'langan" : "Qarzdor"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Guruhlar holati + Bugungi darslar */}
      {!loading && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Guruhlar holati */}
          <div className="bp-panel p-5 bp-fadeup bp-delay-5">
            <h2 className="text-base font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
              Guruhlar holati
            </h2>
            {(data?.groupStatus || []).length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Guruhlar yo'q</p>
            ) : (
              <div className="space-y-3">
                {(data?.groupStatus || []).slice(0, 6).map((g, i) => {
                  const pct = g.total ? Math.round((g.present_today || 0) / g.total * 100) : 0;
                  const barClass = pct >= 70 ? 'bp-progress-good' : pct >= 40 ? 'bp-progress-mid' : 'bp-progress-low';
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{g.name}</span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>
                        {g.present_today || 0}/{g.total || 0}
                      </span>
                      <div className="w-24 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className={`bp-progress-fill ${barClass}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bugungi darslar */}
          <div className="bp-panel p-5 bp-fadeup bp-delay-5">
            <h2 className="text-base font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
              Bugungi darslar
            </h2>
            {(data?.todayLessons || []).length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Bugun darslar yo'q</p>
            ) : (
              <div className="space-y-3">
                {(data?.todayLessons || []).slice(0, 6).map((l, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{l.name}</span>
                      {l.time && <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>— {l.time}</span>}
                    </div>
                    <span className={`bp-badge ${l.marked ? 'bp-badge-tolangan' : 'bp-badge-kutilmoqda'}`}>
                      {l.marked ? '✓ Belgilandi' : 'Kutilmoqda'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
