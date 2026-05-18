import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Table } from "../components/ui/Table";

type Group = { id: number; name: string };
type SmsLog = {
  id: number;
  sent_at: string;
  full_name: string;
  phone: string;
  message: string;
  status: "sent" | "error" | "pending";
  group_name?: string;
};

type SmsResponse = {
  rows: SmsLog[];
  stats: {
    total: number;
    sent: number;
    error: number;
  };
};

export function SmsPage() {
  const [rows, setRows] = useState<SmsLog[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [month, setMonth] = useState("");
  const [status, setStatus] = useState("");
  const [groupId, setGroupId] = useState("");
  const [stats, setStats] = useState({ total: 0, sent: 0, error: 0 });

  const load = async () => {
    const [logsResponse, groupsResponse] = await Promise.all([
      api.get<SmsResponse>("/sms/logs", { params: { month, status, group_id: groupId } }),
      api.get<Group[]>("/groups"),
    ]);
    setRows(logsResponse.data.rows);
    setStats(logsResponse.data.stats);
    setGroups(groupsResponse.data);
  };

  useEffect(() => {
    load();
  }, [month, status, groupId]);

  return (
    <div className="page-stack">
      <div>
        <h1>SMS loglari</h1>
        <p>Tarix, filtrlar va qayta yuborish</p>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Jami</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-note">Barcha loglar</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Yuborildi</div>
          <div className="stat-value">{stats.sent}</div>
          <div className="stat-note">Muvaffaqiyatli</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Xato</div>
          <div className="stat-value">{stats.error}</div>
          <div className="stat-note">Eskiz xatolari</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Filtr</div>
          <div className="stat-value">{month || "Barchasi"}</div>
          <div className="stat-note">Tanlangan oy</div>
        </div>
      </section>

      <section className="bp-card card-pad">
        <div className="toolbar-filters">
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
          <div className="filter-box">
            <label className="form-label">
              Status
              <select
                className="bp-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Barchasi</option>
                <option value="sent">sent</option>
                <option value="error">error</option>
                <option value="pending">pending</option>
              </select>
            </label>
          </div>
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
        </div>
      </section>

      <Table columns={["Sana", "O'quvchi", "Telefon", "Xabar", "Holat", "Amal"]}>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.sent_at ? new Date(row.sent_at).toLocaleString("uz-UZ") : "—"}</td>
            <td>{row.full_name || "—"}</td>
            <td>{row.phone}</td>
            <td style={{ maxWidth: 360 }}>{row.message}</td>
            <td>
              <Badge
                status={
                  row.status === "sent"
                    ? "sent"
                    : row.status === "error"
                      ? "error"
                      : "pending"
                }
              >
                {row.status}
              </Badge>
            </td>
            <td>
              <Button
                variant="secondary"
                onClick={async () => {
                  await api.post(`/sms/${row.id}/resend`);
                  toast.success("Qayta yuborildi");
                  await load();
                }}
              >
                Qayta yuborish
              </Button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
