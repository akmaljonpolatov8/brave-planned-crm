import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const months = ['YAN','FEV','MAR','APR','MAY','IYN','IYL','AVG','SEP','OKT','NOY','DEK'];
const dayNames = ['Yak','Du','Se','Chor','Pay','Jum','Shan'];

function formatDate() {
  const now = new Date();
  return `${now.getFullYear()} M${months[now.getMonth()]}${now.getDate().toString().padStart(2,'0')}, ${dayNames[now.getDay()]}`;
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ height: '120px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ height: '130px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
      <div style={{ height: '250px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />
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

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,214,98,0.12)',
    borderRadius: '16px',
    padding: '24px',
  };

  const sectionTitle: React.CSSProperties = {
    color: '#FFD662',
    fontSize: '12px',
    letterSpacing: '1.5px',
    fontWeight: 600,
    textTransform: 'uppercase',
    marginBottom: '16px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,214,98,0.12), rgba(255,214,98,0.04))',
        border: '1px solid rgba(255,214,98,0.2)',
        borderRadius: '16px',
        padding: '28px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div>
          <h1 style={{ color: '#FFD662', fontSize: '32px', fontWeight: 700, margin: 0 }}>
            Xush kelibsiz, {user?.full_name || user?.username}! 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', marginTop: '8px', fontSize: '15px' }}>
            Bugungi holat va ko'rsatkichlar
          </p>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>{formatDate()}</span>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="stats-responsive">
        <div style={cardStyle}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', marginBottom: '12px' }}>Jami o'quvchilar</p>
          <p style={{ color: '#FFD662', fontSize: '48px', fontWeight: 700, lineHeight: 1 }}>{data?.students ?? 0}</p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginTop: '4px' }}>Bu oy +{data?.studentsDelta ?? 0} ta</p>
        </div>
        <div style={cardStyle}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', marginBottom: '12px' }}>Faol guruhlar</p>
          <p style={{ color: '#FFD662', fontSize: '48px', fontWeight: 700, lineHeight: 1 }}>{data?.groups ?? 0}</p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginTop: '4px' }}>{data?.teachers ?? 0} o'qituvchi</p>
        </div>
        <div style={cardStyle}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', marginBottom: '12px' }}>Daromad (oy)</p>
          <p style={{ color: '#FFD662', fontSize: '48px', fontWeight: 700, lineHeight: 1 }}>
            {isOwner ? formatRevenue(data?.revenue ?? 0) : '—'}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginTop: '4px' }}>so'm</p>
        </div>
        <div style={cardStyle}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', marginBottom: '12px' }}>Qarzdorlar</p>
          <p style={{ color: (data?.debtors ?? 0) > 0 ? '#f87171' : '#FFD662', fontSize: '48px', fontWeight: 700, lineHeight: 1 }}>
            {data?.debtors ?? 0}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginTop: '4px' }}>15-dan keyin</p>
        </div>
      </div>

      {/* Oxirgi to'lovlar */}
      <div style={cardStyle}>
        <h2 style={sectionTitle as any}>OXIRGI TO'LOVLAR</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)' }}>O'quvchi</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)' }}>Guruh</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)' }}>Summa</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)' }}>Holat</th>
              </tr>
            </thead>
            <tbody>
              {(data?.lastPayments || []).length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                    Hozircha to'lovlar yo'q
                  </td>
                </tr>
              ) : (
                (data?.lastPayments || []).slice(0, 5).map((p, i) => (
                  <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{p.full_name}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>{p.group_name || '—'}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.8)' }}>
                      {isOwner ? (p.amount || 0).toLocaleString() : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '4px 12px', borderRadius: '20px',
                        fontSize: '12px', fontWeight: 600,
                        background: p.paid ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                        color: p.paid ? '#4ade80' : '#f87171',
                      }}>
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

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="bottom-grid-responsive">
        {/* Guruhlar holati */}
        <div style={cardStyle}>
          <h2 style={sectionTitle as any}>GURUHLAR HOLATI</h2>
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {(data?.groupStatus || []).length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Guruhlar yo'q</p>
            ) : (
              (data?.groupStatus || []).map((g, i) => {
                const pct = g.capacity > 0 ? Math.min(100, Math.round((g.enrolled / g.capacity) * 100)) : 0;
                return (
                  <div key={i} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{g.name}</span>
                      <span style={{ color: '#FFD662', fontSize: '14px', fontWeight: 600 }}>{g.enrolled}/{g.capacity}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.08)', height: '4px', borderRadius: '2px' }}>
                      <div style={{ background: '#FFD662', height: '4px', borderRadius: '2px', width: `${pct}%`, transition: 'width 0.7s ease' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bugungi attendance */}
        <div style={cardStyle}>
          <h2 style={sectionTitle as any}>BUGUNGI ATTENDANCE</h2>
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {(data?.todayLessons || []).length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Bugun darslar yo'q</p>
            ) : (
              (data?.todayLessons || []).map((l, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                    {l.name}{l.time ? ` – ${l.time}` : ''}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: l.marked ? '#4ade80' : '#f59e0b' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.marked ? '#4ade80' : '#f59e0b', display: 'inline-block' }} />
                    {l.marked ? 'Belgilandi' : 'Kutilmoqda'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
