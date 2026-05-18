import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { canManage } from "../lib/permissions";

type Group = { id: number; name: string };
type AttendanceRow = {
  student_id: number;
  full_name: string;
  status: string;
  note: string;
};

const statuses = [
  ["present", "✓ Keldi"],
  ["absent", "✗ Kelmadi"],
  ["late", "⏰ Kech"],
  ["excused", "📋 Sabab"],
] as const;

export function AttendancePage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const readOnly = !canManage(user);

  const load = async () => {
    const groupsResponse = await api.get<Group[]>("/groups");
    setGroups(groupsResponse.data);
    if (!groupId && groupsResponse.data[0]) {
      setGroupId(String(groupsResponse.data[0].id));
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!groupId) return;
    api
      .get<AttendanceRow[]>("/attendance", { params: { group_id: groupId, date } })
      .then((response) => setRows(response.data));
  }, [groupId, date]);

  const summary = useMemo(() => {
    const total = rows.length || 1;
    const present = rows.filter((row) => row.status === "present").length;
    const late = rows.filter((row) => row.status === "late").length;
    return {
      total: rows.length,
      average: Math.round(((present + late) / total) * 100),
    };
  }, [rows]);

  const updateStatus = (studentId: number, status: string) => {
    if (readOnly) return;
    setRows((current) =>
      current.map((row) =>
        row.student_id === studentId ? { ...row, status } : row,
      ),
    );
  };

  const save = async () => {
    await api.post("/attendance", {
      group_id: Number(groupId),
      date,
      records: rows.map((row) => ({
        student_id: row.student_id,
        status: row.status || "absent",
        note: row.note || "",
      })),
    });
    toast.success("Davomat saqlandi");
  };

  return (
    <div className="page-stack">
      <div className="toolbar">
        <div>
          <h1>Davomat</h1>
          <p>
            {readOnly
              ? "Teacher uchun faqat ko'rish rejimi"
              : "Owner va manager yozishi mumkin"}
          </p>
        </div>
        {!readOnly ? <Button onClick={save}>Saqlash</Button> : null}
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
              Sana
              <input
                className="bp-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="grid-two">
        <div className="bp-card card-pad">
          <h3>Bugungi belgilash</h3>
          <div className="page-stack" style={{ marginTop: 16 }}>
            {rows.map((row) => (
              <div key={row.student_id} className="bp-card card-pad">
                <div className="page-header">
                  <strong>{row.full_name}</strong>
                  <span>{row.status || "Tanlanmagan"}</span>
                </div>
                <div className="attendance-actions" style={{ marginTop: 12 }}>
                  {statuses.map(([value, label]) => (
                    <button
                      key={value}
                      className={`status-chip ${row.status === value ? `active-${value}` : ""}`}
                      onClick={() => updateStatus(row.student_id, value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bp-card card-pad">
          <h3>Statistika</h3>
          <div className="page-stack" style={{ marginTop: 16 }}>
            <div>Jami o'quvchilar: {summary.total}</div>
            <div>O'rtacha davomat: {summary.average}%</div>
            <div>Tanlangan sana: {date}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
