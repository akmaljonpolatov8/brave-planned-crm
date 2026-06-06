import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { PageShell } from "../components/PageShell";

type Group = { id: number; name: string };
type GroupStudent = { id: number; full_name: string };

export function AttendancePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupStudents, setGroupStudents] = useState<GroupStudent[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [attendance, setAttendance] = useState<
    Record<string, Record<string, "present" | "absent">>
  >({});
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Load groups
  useEffect(() => {
    api.get("/groups").then((res) => {
      setGroups(res.data);
      if (!selectedGroup && res.data[0]) {
        setSelectedGroup(String(res.data[0].id));
      }
    });
  }, []);

  // Load students for selected group (from /api/groups/:id/students)
  useEffect(() => {
    if (!selectedGroup) return;
    setStudentsLoading(true);
    api
      .get(`/groups/${selectedGroup}/students`)
      .then((res) => {
        setGroupStudents(res.data);
      })
      .catch(() => {
        setGroupStudents([]);
      })
      .finally(() => setStudentsLoading(false));
  }, [selectedGroup]);

  // Load attendance data for the month
  useEffect(() => {
    if (!selectedGroup) return;
    setLoading(true);
    api
      .get(`/attendance/month/${selectedGroup}/${month}`)
      .then((res) => {
        const next: Record<string, Record<string, "present" | "absent">> = {};
        (
          res.data as Array<{
            student_id: number;
            date: string;
            status: "present" | "absent";
          }>
        ).forEach((item) => {
          const studentKey = String(item.student_id);
          if (!next[studentKey]) next[studentKey] = {};
          next[studentKey][item.date] = item.status;
        });
        setAttendance(next);
      })
      .finally(() => setLoading(false));
  }, [month, selectedGroup]);

  const days = useMemo(() => {
    const [year, monthIndex] = month.split("-").map(Number);
    const totalDays = new Date(year, monthIndex, 0).getDate();
    return Array.from({ length: totalDays }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      return `${month}-${day}`;
    });
  }, [month]);

  const toggleCell = async (studentId: number, dateValue: string) => {
    const current = attendance[String(studentId)]?.[dateValue];
    const nextStatus = current === "present" ? "absent" : "present";

    setAttendance((currentMap) => ({
      ...currentMap,
      [studentId]: {
        ...(currentMap[String(studentId)] || {}),
        [dateValue]: nextStatus,
      },
    }));

    try {
      await api.post("/attendance", {
        groupId: Number(selectedGroup),
        studentId,
        date: dateValue,
        status: nextStatus,
      });
      toast.success("Davomat saqlandi");
    } catch {
      toast.error("Davomat saqlanmadi");
    }
  };

  return (
    <PageShell
      title="Davomat"
      description="Guruh bo'yicha oylik grid va bir bosishda saqlash."
    >
      <div className="panel grid gap-4 p-4 lg:grid-cols-[1.3fr_1fr_1fr]">
        <select
          className="input"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
        <input
          className="input"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
        <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/70">
          <span>
            {studentsLoading || loading
              ? "Yuklanmoqda..."
              : `${groupStudents.length} o'quvchi`}
          </span>
          <span style={{ color: '#FFD662' }}>Auto-save</span>
        </div>
      </div>

      <div className="panel overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-max">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-[#1a0f2e] text-left px-4 py-3">
                  O'quvchi
                </th>
                {days.map((dateValue) => (
                  <th key={dateValue} className="text-center px-1 py-3 text-xs">
                    {Number(dateValue.slice(-2))}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groupStudents.length > 0 ? (
                groupStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="sticky left-0 z-10 bg-[#1a0f2e] whitespace-nowrap font-medium px-4 py-2 text-sm">
                      {student.full_name}
                    </td>
                    {days.map((dateValue) => {
                      const status =
                        attendance[String(student.id)]?.[dateValue] || null;
                      const isPresent = status === "present";
                      const isAbsent = status === "absent";

                      return (
                        <td
                          key={`${student.id}-${dateValue}`}
                          className="text-center px-1 py-1"
                        >
                          <button
                            type="button"
                            className={`mx-auto grid h-8 w-8 place-items-center rounded-full border text-xs transition ${
                              isPresent
                                ? "border-green-500 bg-green-500/20 text-green-400"
                                : isAbsent
                                  ? "border-red-500 bg-red-500/20 text-red-400"
                                  : "border-white/10 bg-white/5 text-white/35 hover:border-yellow-400/40 hover:text-yellow-400"
                            }`}
                            onClick={() => toggleCell(student.id, dateValue)}
                          >
                            {isPresent ? "✓" : isAbsent ? "✕" : "•"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={days.length + 1}
                    className="py-10 text-center text-white/50"
                  >
                    {studentsLoading ? "Yuklanmoqda..." : "Bu guruhda o'quvchi topilmadi."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
