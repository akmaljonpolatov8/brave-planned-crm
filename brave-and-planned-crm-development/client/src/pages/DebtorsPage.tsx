import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Table } from "../components/ui/Table";
import { useAuth } from "../context/AuthContext";

type DebtorRow = {
  id: number;
  student_id: number;
  full_name: string;
  group_name: string;
  parent_phone: string;
  amount: number;
  paid: number;
  sms_status?: "sent" | "error" | "pending";
};

type DebtorsResponse = {
  rows: DebtorRow[];
  stats: {
    total: number;
    smsSent: number;
    month: string;
  };
};

export function DebtorsPage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [rows, setRows] = useState<DebtorRow[]>([]);
  const [stats, setStats] = useState({ total: 0, smsSent: 0, month: "" });
  const [selected, setSelected] = useState<number[]>([]);

  const load = async () => {
    const response = await api.get<DebtorsResponse>("/debtors", { params: { month } });
    setRows(response.data.rows);
    setStats(response.data.stats);
  };

  useEffect(() => {
    load();
  }, [month]);

  const totalDebt = useMemo(
    () =>
      rows.reduce((sum, row) => sum + (Number(row.amount) - Number(row.paid)), 0),
    [rows],
  );

  return (
    <div className="page-stack">
      <div className="toolbar">
        <div>
          <h1>Qarzdorlar</h1>
          <p>Oy bo'yicha qarzdorlar va SMS yuborish</p>
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

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Jami qarzdor</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-note">Tanlangan oy</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">SMS yuborildi</div>
          <div className="stat-value">{stats.smsSent}</div>
          <div className="stat-note">Hozirgi filtr</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Bu oy</div>
          <div className="stat-value">{stats.month}</div>
          <div className="stat-note">Oy identifikatori</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Jami summa</div>
          <div className="stat-value">
            {user?.role === "owner" ? totalDebt.toLocaleString("uz-UZ") : "—"}
          </div>
          <div className="stat-note">Owner only</div>
        </div>
      </section>

      <div className="btn-row">
        <Button
          onClick={async () => {
            await api.post("/sms/send-debtors", {
              month,
              payment_ids: selected,
            });
            toast.success("SMS yuborildi");
            await load();
          }}
          disabled={!selected.length}
        >
          Tanlanganlar uchun SMS
        </Button>
      </div>

      <Table
        columns={[
          "#",
          "O'quvchi",
          "Guruh",
          "Ota-ona tel",
          "Summa",
          "SMS holati",
          "Amal",
        ]}
      >
        {rows.map((row, index) => {
          const checked = selected.includes(row.id);
          return (
            <tr key={row.id}>
              <td>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setSelected((current) =>
                      checked
                        ? current.filter((id) => id !== row.id)
                        : [...current, row.id],
                    )
                  }
                />
                {" "}
                {index + 1}
              </td>
              <td>{row.full_name}</td>
              <td>{row.group_name}</td>
              <td>{row.parent_phone || "—"}</td>
              <td>
                {user?.role === "owner"
                  ? (row.amount - row.paid).toLocaleString("uz-UZ")
                  : "—"}
              </td>
              <td>
                <Badge
                  status={
                    row.sms_status === "sent"
                      ? "sent"
                      : row.sms_status === "error"
                        ? "error"
                        : "new"
                  }
                >
                  {row.sms_status === "sent"
                    ? "Yuborildi"
                    : row.sms_status === "error"
                      ? "Xato"
                      : "Yangi"}
                </Badge>
              </td>
              <td>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await api.post("/sms/send-debtors", { month, payment_ids: [row.id] });
                    toast.success("Individual SMS yuborildi");
                    await load();
                  }}
                >
                  SMS
                </Button>
              </td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}
