import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { PageShell } from "../components/PageShell";
import type { Group, Student } from "../types";

export function AttendancePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [attendance, setAttendance] = useState<
    Record<string, Record<string, "present" | "absent">>
  >({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/groups").then((res) => {
      setGroups(res.data);
      if (!selectedGroup && res.data[0]) {
        setSelectedGroup(String(res.data[0].id));
      }
    });
  }, []);

  useEffect(() => {
    api.get("/students").then((res) => setStudents(res.data));
  }, []);

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

  const currentGroupStudents = useMemo(
    () =>
      students.filter(
        (student) => String(student.group_id || "") === selectedGroup,
      ),
    [selectedGroup, students],
  );

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
            {loading
              ? "Yuklanmoqda..."
              : `${currentGroupStudents.length} o'quvchi`}
          </span>
          <span className="text-[#46CFB0]">Auto-save</span>
        </div>
      </div>

      <div className="panel overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-max">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-[#042424] text-left">
                  O'quvchi
                </th>
                {days.map((dateValue) => (
                  <th key={dateValue} className="text-center">
                    {Number(dateValue.slice(-2))}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentGroupStudents.length ? (
                currentGroupStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="sticky left-0 z-10 bg-[#042424] whitespace-nowrap font-medium">
                      {student.full_name}
                    </td>
                    {days.map((dateValue) => {
                      const status =
                        attendance[String(student.id)]?.[dateValue] || null;
                      const isPresent = status === "present";
                      const isAbsent = status === "absent";
                      const statusLabel = isPresent ? "bor" : isAbsent ? "yo'q" : "belgilanmagan";

                      return (
                        <td
                          key={`${student.id}-${dateValue}`}
                          className="text-center"
                        >
                          <button
                            type="button"
                            className={`mx-auto grid h-9 w-9 place-items-center rounded-full border text-sm transition ${isPresent ? "border-[#46CFB0] bg-[#46CFB0]/20 text-[#46CFB0]" : isAbsent ? "border-[#ff6b6b] bg-[#ff6b6b]/20 text-[#ff6b6b]" : "border-white/10 bg-white/5 text-white/35 hover:border-[#46CFB0]/40 hover:text-[#46CFB0]"}`}
                            onClick={() => toggleCell(student.id, dateValue)}
                            aria-label={`${student.full_name}, ${Number(dateValue.slice(-2))}-kuni: ${statusLabel}`}
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
                    Bu guruhda o'quvchi topilmadi.
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
