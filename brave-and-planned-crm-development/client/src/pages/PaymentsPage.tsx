import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { Modal } from "../components/Modal";
import { PageShell } from "../components/PageShell";
import { StatCard } from "../components/StatCard";
import { PaymentTable } from "../components/PaymentTable";
import { useAuth } from "../context/AuthContext";
import type { Group, Payment } from "../types";

export function PaymentsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState("");
  const [rows, setRows] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [editing, setEditing] = useState<Payment | null>(null);

  const load = async () => {
    const [groupRes, paymentRes] = await Promise.all([
      api.get("/groups"),
      api.get("/payments", {
        params: {
          group_id: groupId || undefined,
          month: new Date().toISOString().slice(0, 7),
        },
      }),
    ]);
    setGroups(groupRes.data);
    setRows(paymentRes.data.rows);
    setSummary(paymentRes.data.summary || null);
  };
  useEffect(() => {
    load();
  }, [groupId]);

  return (
    <PageShell
      title="To'lovlar"
      description="Guruh bo'yicha filtr, to'landi tugmasi va miqdorni tahrirlash."
    >
      <div className="panel mb-4 grid gap-4 p-4 md:grid-cols-2">
        <select
          className="input"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
        >
          <option value="">Barcha guruhlar</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
      {user?.role === "owner" && summary ? (
        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <StatCard
            label="Jami tushum"
            value={`${summary.total_revenue ?? 0} so'm`}
            hint="Owner uchun"
          />
          <StatCard
            label="To'langan"
            value={summary.paid_count ?? 0}
            hint="Joriy oy"
          />
          <StatCard
            label="Qarz"
            value={summary.unpaid_count ?? 0}
            hint="Joriy oy"
          />
        </div>
      ) : null}
      <PaymentTable
        rows={rows}
        onPaid={async (id) => {
          await api.patch(`/payments/${id}/pay`);
          toast.success("To'landi");
          load();
        }}
        onEdit={(row) => setEditing(row)}
      />
      {editing ? (
        <Modal title="To'lovni tahrirlash" onClose={() => setEditing(null)}>
          <input
            className="input"
            type="number"
            value={editing.amount}
            onChange={(e) =>
              setEditing({ ...editing, amount: Number(e.target.value) })
            }
          />
          <div className="mt-5 flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setEditing(null)}>
              Bekor qilish
            </button>
            <button
              className="btn-primary"
              onClick={async () => {
                await api.put(`/payments/${editing.id}`, {
                  amount: editing.amount,
                });
                toast.success("Yangilandi");
                setEditing(null);
                load();
              }}
            >
              Saqlash
            </button>
          </div>
        </Modal>
      ) : null}
    </PageShell>
  );
}
