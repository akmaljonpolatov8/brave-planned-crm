import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
import { useAuth } from "../context/AuthContext";

type Group = { id: number; name: string };
type Payment = {
  id: number;
  group_id: number;
  full_name: string;
  group_name: string;
  amount: number;
  paid: number;
  note?: string;
  status: "paid" | "unpaid" | "pending";
};

export function PaymentsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [rows, setRows] = useState<Payment[]>([]);
  const [groupId, setGroupId] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [editing, setEditing] = useState<Payment | null>(null);
  const [form, setForm] = useState({ amount: 0, paid: 0, note: "" });

  const load = async () => {
    const [groupsResponse, paymentsResponse] = await Promise.all([
      api.get<Group[]>("/groups"),
      api.get<Payment[]>("/payments", {
        params: { group_id: groupId || undefined, month },
      }),
    ]);
    setGroups(groupsResponse.data);
    setRows(paymentsResponse.data);
  };

  useEffect(() => {
    load();
  }, [groupId, month]);

  return (
    <div className="page-stack">
      <div className="toolbar">
        <div>
          <h1>To'lovlar</h1>
          <p>Filter, generate va to'landi/to'lanmadi nazorati</p>
        </div>
        {user?.role === "owner" ? (
          <Button
            onClick={async () => {
              await api.post("/payments/generate");
              toast.success("Bu oy to'lovlari yaratildi");
              await load();
            }}
          >
            Bu oy to'lovlarini yaratish
          </Button>
        ) : null}
      </div>

      <section className="bp-card card-pad">
        <div className="toolbar-filters">
          <div className="filter-box">
            <label className="form-label">
              Guruh
              <select
                className="bp-select"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
              >
                <option value="">Barchasi</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="filter-box">
            <label className="form-label">
              Oy
              <input
                className="bp-input"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </label>
          </div>
        </div>
      </section>

      <Table columns={["O'quvchi", "Guruh", "Summa", "Holat", "Amal"]}>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.full_name}</td>
            <td>{row.group_name}</td>
            <td>
              {user?.role === "owner"
                ? row.amount.toLocaleString("uz-UZ")
                : "—"}
            </td>
            <td>
              <Badge status={row.status}>
                {row.status === "paid"
                  ? "To'langan"
                  : row.status === "pending"
                    ? "Kutilmoqda"
                    : "Qarzdor"}
              </Badge>
            </td>
            <td>
              <div className="btn-row">
                {row.status !== "paid" && user?.role !== "teacher" ? (
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      await api.put(`/payments/${row.id}`, { paid: row.amount });
                      toast.success("To'lov belgilandi");
                      await load();
                    }}
                  >
                    To'landi
                  </Button>
                ) : null}
                {user?.role !== "teacher" ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditing(row);
                      setForm({
                        amount: row.amount,
                        paid: row.paid,
                        note: row.note || "",
                      });
                    }}
                  >
                    Tahrirlash
                  </Button>
                ) : (
                  "—"
                )}
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Modal
        open={!!editing}
        title="To'lovni tahrirlash"
        onClose={() => setEditing(null)}
      >
        <div className="form-grid">
          {user?.role === "owner" ? (
            <label className="form-label">
              Summa
              <input
                className="bp-input"
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    amount: Number(e.target.value),
                  }))
                }
              />
            </label>
          ) : null}
          <label className="form-label">
            To'langan summa
            <input
              className="bp-input"
              type="number"
              value={form.paid}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  paid: Number(e.target.value),
                }))
              }
            />
          </label>
          <label className="form-label">
            Izoh
            <textarea
              className="bp-textarea"
              rows={3}
              value={form.note}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  note: e.target.value,
                }))
              }
            />
          </label>
          <Button
            onClick={async () => {
              if (!editing) return;
              await api.put(`/payments/${editing.id}`, {
                paid: form.paid,
                note: form.note,
                ...(user?.role === "owner" ? { amount: form.amount } : {}),
              });
              toast.success("To'lov yangilandi");
              setEditing(null);
              await load();
            }}
          >
            Saqlash
          </Button>
        </div>
      </Modal>
    </div>
  );
}
