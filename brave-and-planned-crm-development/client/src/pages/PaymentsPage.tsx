import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { PageShell } from "../components/PageShell";
import { useAuth } from "../context/AuthContext";

type Group = { id: number; name: string; monthly_fee?: number };
type PaymentRow = { id: number; student_id: number; full_name: string; amount: number; paid: number; paid_at?: string; group_name?: string };

export function PaymentsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(false);

  const isOwner = user?.role === "owner";

  const load = async () => {
    setLoading(true);
    try {
      const [groupRes, paymentRes] = await Promise.all([
        api.get("/groups"),
        api.get("/payments", { params: { group_id: groupId || undefined, month } }),
      ]);
      setGroups(groupRes.data);
      setPayments(Array.isArray(paymentRes.data) ? paymentRes.data : paymentRes.data.rows || []);
    } catch (err) {
      console.error("Payments load error:", err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [groupId, month]);

  const togglePaid = async (payment: PaymentRow) => {
    try {
      await api.put(`/payments/${payment.id}`, { paid: payment.paid ? 0 : 1 });
      toast.success(payment.paid ? "Qarz belgilandi" : "To'landi belgilandi");
      load();
    } catch { toast.error("Xatolik"); }
  };

  return (
    <PageShell title="To'lovlar" description="Guruh bo'yicha filtr va to'lov holati.">
      <div className="panel mb-4 grid gap-4 p-4 md:grid-cols-3">
        <select className="input" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          <option value="">Barcha guruhlar</option>
          {groups.map((g) => (<option key={g.id} value={g.id}>{g.name}</option>))}
        </select>
        <input className="input" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        <div className="flex items-center text-sm text-white/60">{payments.length} ta yozuv</div>
      </div>

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>O'quvchi</th>
              <th>Guruh</th>
              {isOwner && <th>Summa</th>}
              <th>Holat</th>
              <th>Amal</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={isOwner ? 6 : 5} className="py-8 text-center text-white/40">
                {loading ? "Yuklanmoqda..." : "To'lovlar topilmadi"}
              </td></tr>
            ) : (
              payments.map((p, i) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td>{p.full_name}</td>
                  <td className="text-white/60">{p.group_name || "—"}</td>
                  {isOwner && <td>{(p.amount || 0).toLocaleString()} so'm</td>}
                  <td>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${p.paid ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                      {p.paid ? "To'langan" : "Qarzdor"}
                    </span>
                  </td>
                  <td>
                    <button className={`btn text-xs ${p.paid ? "btn-danger" : "btn-primary"}`} onClick={() => togglePaid(p)}>
                      {p.paid ? "Qarz qilish" : "To'landi"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
