import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

type Group = { id: number; name: string };
type Student = { id: number; full_name: string; phone?: string };
type Status = "present" | "absent" | "late" | "excused";

const STATUSES: { key: Status; label: string; icon: string }[] = [
  { key: "present", label: "Keldi", icon: "✓" },
  { key: "absent", label: "Yo'q", icon: "✗" },
  { key: "late", label: "Kech", icon: "⏰" },
  { key: "excused", label: "Uzrli", icon: "📝" },
];

export function AttendancePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/groups").then((res) => {
      setGroups(res.data);
      if (res.data[0]) setSelectedGroup(String(res.data[0].id));
    });
  }, []);

  useEffect(() => {
    if (!selectedGroup) return;
    setLoading(true);
    Promise.all([
      api.get(`/groups/${selectedGroup}/students`),
      api.get(`/attendance/${selectedGroup}/${selectedDate}`),
    ])
      .then(([studentsRes, attendanceRes]) => {
        setStudents(studentsRes.data || []);
        const map: Record<string, Status> = {};
        (attendanceRes.data || []).forEach((a: any) => {
          map[String(a.student_id)] = a.status;
        });
        setAttendance(map);
      })
      .catch(() => { setStudents([]); setAttendance({}); })
      .finally(() => setLoading(false));
  }, [selectedGroup, selectedDate]);

  const markStudent = (studentId: number, status: Status) => {
    setAttendance((prev) => ({ ...prev, [String(studentId)]: status }));
  };

  const markAll = (status: Status) => {
    const map: Record<string, Status> = {};
    students.forEach((s) => { map[String(s.id)] = status; });
    setAttendance(map);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const rows = Object.entries(attendance).map(([studentId, status]) => ({
        studentId: Number(studentId), status,
      }));
      await api.post("/attendance", { groupId: Number(selectedGroup), date: selectedDate, rows });
      toast.success(`${rows.length} ta davomat saqlandi ✓`);
    } catch { toast.error("Xatolik yuz berdi"); }
    finally { setSaving(false); }
  };

  const presentCount = Object.values(attendance).filter((s) => s === "present").length;
  const absentCount = Object.values(attendance).filter((s) => s === "absent").length;
  const lateCount = Object.values(attendance).filter((s) => s === "late").length;

  return (
    <div className="attendance-page">
      <div className="controls-bar">
        <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
          <option value="">Guruh tanlang...</option>
          {groups.map((g) => (<option key={g.id} value={g.id}>{g.name}</option>))}
        </select>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        {students.length > 0 && (
          <div className="stats-bar">
            <div className="stat-chip present">✓ {presentCount} keldi</div>
            <div className="stat-chip absent">✗ {absentCount} yo'q</div>
            <div className="stat-chip late">⏰ {lateCount} kech</div>
          </div>
        )}
      </div>

      {students.length > 0 && (
        <div className="bulk-bar">
          <span>{students.length} o'quvchi</span>
          <div className="bulk-buttons">
            <button onClick={() => markAll("present")}>Barchasini keldi</button>
            <button onClick={() => markAll("absent")}>Barchasini yo'q</button>
          </div>
        </div>
      )}

      <div className="student-list">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="student-card" style={{ height: '94px', background: 'rgba(255,255,255,0.04)' }} />
          ))
        ) : !selectedGroup ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <div style={{ fontSize: '16px' }}>Guruh tanlang</div>
          </div>
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <div style={{ fontSize: '16px' }}>Bu guruhda o'quvchi yo'q</div>
          </div>
        ) : (
          students.map((student, i) => {
            const status = attendance[String(student.id)] || null;
            return (
              <div key={student.id} className={`student-card ${status ? `status-${status}` : ''}`}>
                <div className="student-name-row">
                  <span className="student-index">{i + 1}.</span>
                  <span className="student-name">{student.full_name}</span>
                </div>
                <div className="status-buttons">
                  {STATUSES.map((s) => (
                    <button key={s.key} onClick={() => markStudent(student.id, s.key)}
                      className={`status-btn ${status === s.key ? `active-${s.key}` : 'inactive'}`}>
                      <span>{s.icon}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {students.length > 0 && (
        <div className="save-bar">
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saqlanmoqda..." : "💾 Saqlash"}
          </button>
        </div>
      )}
    </div>
  );
}
