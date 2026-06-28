import type { AttendanceRecord, Student } from "../types";

const daysInMonth = (month: string) => {
  const [year, m] = month.split("-").map(Number);
  return new Date(year, m, 0).getDate();
};

export function AttendanceGrid({
  month,
  students,
  records,
  onToggle,
}: {
  month: string;
  students: Student[];
  records: AttendanceRecord[];
  onToggle: (studentId: number, date: string, current?: "present" | "absent") => void;
}) {
  const days = Array.from({ length: daysInMonth(month) }, (_, index) => index + 1);
  const map = new Map(records.map((item) => [`${item.student_id}-${item.date}`, item.status]));

  const getStatusLabel = (status: "present" | "absent" | undefined) => {
    if (status === "present") return "keldi";
    if (status === "absent") return "kelmadi";
    return "belgilanmagan";
  };

  return (
    <div className="table-shell">
      <table className="border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="sticky left-0 z-20 bg-[var(--bg-deep)] outline outline-1 outline-[var(--border)]">
              O'quvchi
            </th>
            {days.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td className="sticky left-0 z-10 bg-[var(--bg-deep)] font-medium outline outline-1 outline-[var(--border)]">
                {student.full_name}
              </td>
              {days.map((day) => {
                const date = `${month}-${String(day).padStart(2, "0")}`;
                const status = map.get(`${student.id}-${date}`) as "present" | "absent" | undefined;
                const color =
                  status === "present"
                    ? "bg-emerald-500/50"
                    : status === "absent"
                    ? "bg-red-500/50"
                    : "bg-white/10";
                const label = `${student.full_name}, ${day}-kun: ${getStatusLabel(status)}`;

                return (
                  <td key={date}>
                    <button
                      aria-label={label}
                      title={label}
                      className={`h-8 w-8 rounded-lg transition-all hover:brightness-125 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${color}`}
                      onClick={() => onToggle(student.id, date, status)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
