import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { PageShell } from "../components/PageShell";
import { useAuth } from "../context/AuthContext";

type Group = { id: number; name: string };
type PaymentRow = { id: number | null; student_id: number; full_name: string; phone?: string; amount: number; paid: number; group_name: string; month: string };

export function PaymentsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);

  const isOwner = user?.role === "owner";

  useEffect(() => {
    api.get("/groups").then((res) => setGroups(res.data));
  }, []);

  const loadPayments = async () => {
    if (!groupId) { setPayments([]); return; }
    setLoading(true);
    try {
      const res = await api.get("/payments", { params: { group_id: groupId, month } });
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch { setPayments([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadPayments(); }, [groupId, month]);

  const togglePaid = async (row: PaymentRow) => {
    setToggling(row.student_id);
    try {
      const newPaid = row.paid ? 0 : 1;
      await api.post("/payments/toggle", {
        student_id: row.student_id,
        group_id: Number(groupId),
        month,
        paid: newPaid,
      });
      // Update local state
      setPayments(prev => prev.map(p =>
        p.student_id === row.student_id ? { ...p, paid: newPaid } : p
      ));
      toast.success(newPaid ? `${row.full_name} — To'langan ✓` : `${row.full_name} — To'lanmagan`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xatolik");
    } finally {
      setToggling(null);
    }
  };

  const paidCount = payments.filter(p => p.paid).length;
  const unpaidCount = payments.filter(p => !p.paid).length;

  return (
    <PageShell title="To'lovlar" description="Guruh va oy tanlang — har bir o'quvchi uchun to'lov holatini belgilang.">
      {/* Filters */}
      <div className="panel p-4 grid gap-4 md:grid-cols-3" style={{ marginBottom: '16px' }}>
        <select className="input" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          <option value="">— Guruh tanlang —</option>
          {groups.map((g) => (<option key={g.id} value={g.id}>{g.name}</option>))}
        </select>
        <input className="input" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        {groupId && payments.length > 0 && (
          <div className="flex items-center gap-3 text-sm">
            <span style={{ color: '#4ade80' }}>✓ {paidCount} to'lagan</span>
            <span style={{ color: '#f87171' }}>✗ {unpaidCount} to'lamagan</span>
          </div>
        )}
      </div>

      {/* Content */}
      {!groupId ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
          <div>Guruh tanlang</div>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>Yuklanmoqda...</div>
      ) : payments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>Bu guruhda o'quvchi topilmadi</div>
      ) : (
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>O'quvchi</th>
                <th>Telefon</th>
                {isOwner && <th>Summa</th>}
                <th>Holat</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={p.student_id}>
                  <td>{i + 1}</td>
                  <td className="font-medium">{p.full_name}</td>
                  <td style={{ color: 'rgba(255,255,255,0.5)' }}>{p.phone || "—"}</td>
                  {isOwner && <td style={{ color: '#FFD662', fontWeight: 600 }}>{(p.amount || 0).toLocaleString()} so'm</td>}
                  <td>
                    <button
                      onClick={() => togglePaid(p)}
                      disabled={toggling === p.student_id}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: toggling === p.student_id ? 'not-allowed' : 'pointer',
                        background: p.paid ? 'rgba(34,197,94,0.15)' : 'rgba(220,38,38,0.12)',
                        color: p.paid ? '#4ade80' : '#f87171',
                        transition: 'all 0.15s',
                      }}
                    >
                      {toggling === p.student_id ? '...' : p.paid ? "✓ To'langan" : "✗ To'lanmagan"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
