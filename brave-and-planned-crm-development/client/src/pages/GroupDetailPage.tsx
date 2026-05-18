import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { AttendanceGrid } from "../components/AttendanceGrid";
import { Modal } from "../components/Modal";
import { PageShell } from "../components/PageShell";
import type { AttendanceRecord, Group, Student } from "../types";

export function GroupDetailPage() {
  const { id } = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [studentModal, setStudentModal] = useState(false);
  const [studentForm, setStudentForm] = useState({ full_name: "", ota_phone: "", ona_phone: "", telefon: "" });

  const load = async () => {
    const [groupRes, attendanceRes] = await Promise.all([
      api.get(`/groups/${id}`),
      api.get(`/groups/${id}/attendance`, { params: { month } }),
    ]);
    setGroup(groupRes.data);
    setRecords(attendanceRes.data);
  };

  useEffect(() => { load(); }, [id, month]);

  const toggleAttendance = async (studentId: number, date: string, current?: "present" | "absent") => {
    const next = current === "present" ? "absent" : "present";
    await api.post(`/groups/${id}/attendance`, { student_id: studentId, date, status: next });
    load();
  };

  return (
    <PageShell title={group?.name || "Guruh"} description="Guruh tarkibi, to'lov va davomat kalendari." action={<button className="btn-primary" onClick={() => setStudentModal(true)}>O'quvchi qo'shish</button>}>
      <div className="panel p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div>O'qituvchi: {group?.teacher_name || "Biriktirilmagan"}</div>
          <div>Vaqt: {group?.schedule_time || "-"}</div>
          <div>Kunlar: {group?.schedule_days || "-"}</div>
          <input className="input max-w-52" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
      </div>
      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>O'quvchi</th>
              <th>Telefon</th>
              <th>To'lov holati</th>
              <th>Amal</th>
            </tr>
          </thead>
          <tbody>
            {(group?.students || []).map((student: Student) => (
              <tr key={student.id}>
                <td>{student.full_name}</td>
                <td>{student.ota_phone || student.ona_phone || student.telefon || "-"}</td>
                <td>{student.payment_paid ? "To'langan" : "To'lanmagan"}</td>
                <td>
                  <button className="btn-danger" onClick={async () => { await api.delete(`/groups/${id}/students/${student.id}`); load(); }}>
                    Guruhdan olish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AttendanceGrid month={month} students={(group?.students || []) as Student[]} records={records} onToggle={toggleAttendance} />
      {studentModal ? (
        <Modal title="Yangi o'quvchi" onClose={() => setStudentModal(false)}>
          <div className="grid gap-4">
            <input className="input" placeholder="F.I.Sh" value={studentForm.full_name} onChange={(e) => setStudentForm((v) => ({ ...v, full_name: e.target.value }))} />
            <input className="input" placeholder="Ota telefoni" value={studentForm.ota_phone} onChange={(e) => setStudentForm((v) => ({ ...v, ota_phone: e.target.value }))} />
            <input className="input" placeholder="Ona telefoni" value={studentForm.ona_phone} onChange={(e) => setStudentForm((v) => ({ ...v, ona_phone: e.target.value }))} />
            <input className="input" placeholder="Telefon" value={studentForm.telefon} onChange={(e) => setStudentForm((v) => ({ ...v, telefon: e.target.value }))} />
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setStudentModal(false)}>Bekor qilish</button>
            <button className="btn-primary" onClick={async () => { await api.post(`/groups/${id}/students`, studentForm); toast.success("Qo'shildi"); setStudentModal(false); setStudentForm({ full_name: "", ota_phone: "", ona_phone: "", telefon: "" }); load(); }}>Saqlash</button>
          </div>
        </Modal>
      ) : null}
    </PageShell>
  );
}
