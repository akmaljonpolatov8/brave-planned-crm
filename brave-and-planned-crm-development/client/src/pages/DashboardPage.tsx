import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const months = ['YAN','FEV','MAR','APR','MAY','IYN','IYL','AVG','SEP','OKT','NOY','DEK'];
const days = ['Yak','Du','Se','Chor','Pay','Jum','Shan'];

function formatDate() {
  const now = new Date();
  return `${now.getFullYear()} M${months[now.getMonth()]} ${now.getDate().toString().padStart(2,'0')}, ${days[now.getDay()]}`;
}

function formatRevenue(value: number) {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(0) + 'K';
  return value.toLocaleString();
}

type DashboardData = {
  students: number;
  groups: number;
  teachers: number;
  revenue: number;
  debtors: number;
  studentsDelta: number;
  lastPayments: Array<{ full_name: string; group_name: string; amount: number; paid: number }>;
  groupStatus: Array<{ name: string; enrolled: number; capacity: number }>;
  todayLessons: Array<{ name: string; time: string; marked: boolean }>;
};

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-32 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
      <div className="h-64 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard");
      const d = res.data;
      setData({
        students: d.topStats?.students ?? 0,
        groups: d.topStats?.groups ?? 0,
        teachers: d.topStats?.teachers ?? 0,
        revenue: d.topStats?.revenue ?? 0,
        debtors: d.topStats?.unpaid ?? 0,
        studentsDelta: d.topStats?.studentsDelta ?? 0,
        lastPayments: d.lastPayments ?? [],
        groupStatus: (d.groupStatus ?? []).map((g: any) => ({
          name: g.name,
          enrolled: g.present_today ?? g.enrolled ?? 0,
          capacity: g.total ?? g.capacity ?? 30,
        })),
        todayLessons: (d.todayLessons ?? []).map((l: any) => ({
          name: l.name,
          time: l.time || l.start_time || '',
          marked: l.marked ?? false,
        })),
      });
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const isOwner = user?.role === 'owner';

  if (loading) return <Skeleton />;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        className="p-6 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,214,98,0.15), rgba(255,214,98,0.05))',
          border: '1px solid rgba(255,214,98,0.2)',
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#FFD662' }}>
              Xush kelibsiz, {user?.full_name || user?.username}! 👋
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Bugungi holat va ko'rsatkichlar
            </p>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{formatDate()}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Jami o'quvchilar */}
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,214,98,0.12)' }}>
          <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Jami o'quvchilar</p>
          <p className="text-5xl font-extrabold" style={{ color: '#FFD662' }}>{data?.students ?? 0}</p>
          <p className="mt-2 text-xs" style={{ color: 'rgba(74,222,128,0.8)' }}>Bu oy +{data?.studentsDelta ?? 0} ta</p>
        </div>

        {/* Faol guruhlar */}
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,214,98,0.12)' }}>
          <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Faol guruhlar</p>
          <p className="text-5xl font-extrabold" style={{ color: '#FFD662' }}>{data?.groups ?? 0}</p>
          <p className="mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{data?.teachers ?? 0} o'qituvchi</p>
        </div>

        {/* Daromad */}
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,214,98,0.12)' }}>
          <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Daromad (oy)</p>
          <p className="text-5xl font-extrabold" style={{ color: '#FFD662' }}>
            {isOwner ? formatRevenue(data?.revenue ?? 0) : '—'}
          </p>
          <p className="mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>so'm</p>
        </div>

        {/* Qarzdorlar */}
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,214,98,0.12)' }}>
          <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Qarzdorlar</p>
          <p className="text-5xl font-extrabold" style={{ color: (data?.debtors ?? 0) > 0 ? '#f87171' : '#FFD662' }}>
            {data?.debtors ?? 0}
          </p>
          <p className="mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>15-dan keyin</p>
        </div>
      </div>

      {/* Oxirgi to'lovlar */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,214,98,0.1)' }}>
        <div className="px-6 py-4">
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#FFD662', letterSpacing: '1px' }}>
            Oxirgi to'lovlar
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>O'quvchi</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Guruh</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Summa</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Holat</th>
              </tr>
            </thead>
            <tbody>
              {(data?.lastPayments || []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Hozircha to'lovlar yo'q
                  </td>
                </tr>
              ) : (
                (data?.lastPayments || []).slice(0, 5).map((p, i) => (
                  <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="px-6 py-3 font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>{p.full_name}</td>
                    <td className="px-6 py-3" style={{ color: 'rgba(255,255,255,0.6)' }}>{p.group_name || '—'}</td>
                    <td className="px-6 py-3" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      {isOwner ? (p.amount || 0).toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: p.paid ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                          color: p.paid ? '#4ade80' : '#f87171',
                        }}
                      >
                        {p.paid ? "To'langan" : "Qarzdor"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid: Guruhlar holati + Bugungi attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guruhlar holati */}
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,214,98,0.1)' }}>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#FFD662', letterSpacing: '1px' }}>
            Guruhlar holati
          </h2>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {(data?.groupStatus || []).length === 0 ? (
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Guruhlar yo'q</p>
            ) : (
              (data?.groupStatus || []).map((g, i) => {
                const pct = g.capacity > 0 ? Math.min(100, Math.round((g.enrolled / g.capacity) * 100)) : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm truncate mr-2" style={{ color: 'rgba(255,255,255,0.85)' }}>{g.name}</span>
                      <span className="text-sm font-semibold flex-shrink-0" style={{ color: '#FFD662' }}>{g.enrolled}/{g.capacity}</span>
                    </div>
                    <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: '#FFD662' }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bugungi attendance */}
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,214,98,0.1)' }}>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#FFD662', letterSpacing: '1px' }}>
            Bugungi attendance
          </h2>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {(data?.todayLessons || []).length === 0 ? (
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Bugun darslar yo'q</p>
            ) : (
              (data?.todayLessons || []).map((l, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block" style={{ color: 'rgba(255,255,255,0.85)' }}>
                      {l.name}
                    </span>
                    {l.time && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>— {l.time}</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: l.marked ? '#4ade80' : '#f59e0b' }}
                    />
                    <span className="text-xs font-medium" style={{ color: l.marked ? '#4ade80' : '#f59e0b' }}>
                      {l.marked ? 'Belgilandi' : 'Kutilmoqda'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
