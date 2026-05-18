import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { Modal } from "../components/Modal";
import { PageShell } from "../components/PageShell";
import { SearchBar } from "../components/SearchBar";
import type { Group, Student } from "../types";

const emptyForm = { full_name: "", ota_phone: "", ona_phone: "", telefon: "", group_id: "", status: "active" };

export function StudentsPage() {
  const location = useLocation() as { state?: { searchResults?: Student[]; searchQuery?: string } };
  const [students, setStudents] = useState<Student[]>(location.state?.searchResults || []);
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState(location.state?.searchQuery || "");
  const [editing, setEditing] = useState<Student | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const load = async () => {
    const [studentsRes, groupsRes] = await Promise.all([
      api.get("/students", { params: { search } }),
      api.get("/groups"),
    ]);
    setStudents(studentsRes.data);
    setGroups(groupsRes.data);
  };

  useEffect(() => { load(); }, [search]);

  const save = async () => {
    if (!form.full_name) return toast.error("F.I.Sh kiritilsin");
    if (editing?.id) await api.put(`/students/${editing.id}`, form);
    else await api.post("/students", form);
    toast.success("O'quvchi saqlandi");
    setEditing(null);
    setForm(emptyForm);
    load();
  };

  return (
    <PageShell title="O'quvchilar" description="Live search, profil, davomat va transfer boshqaruvi." action={<button className="btn-primary" onClick={() => { setEditing({ id: 0, full_name: "", status: "active" } as Student); setForm(emptyForm); }}>Yangi o'quvchi</button>}>
      <div className="panel p-4">
        <SearchBar value={search} onChange={setSearch} placeholder="F.I.Sh bo'yicha qidirish" />
      </div>
      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>F.I.Sh</th>
              <th>Guruh</th>
              <th>Telefon</th>
              <th>To'lov</th>
              <th>Amal</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.full_name}</td>
                <td>{student.group_name || "-"}</td>
                <td>{student.ota_phone || student.ona_phone || student.telefon || "-"}</td>
                <td>{student.payment_paid ? "To'langan" : "To'lanmagan"}</td>
                <td className="space-x-2">
                  <button className="btn-secondary" onClick={() => { setEditing(student); setForm(student); }}>Tahrirlash</button>
                  <button className="btn-secondary" onClick={async () => setProfile((await api.get(`/students/${student.id}`)).data)}>Profil</button>
                  <button className="btn-secondary" onClick={async () => {
                    const to_group_id = prompt("Yangi group ID");
                    if (!to_group_id) return;
                    await api.post(`/students/${student.id}/transfer`, { to_group_id });
                    toast.success("Transfer saqlandi");
                    load();
                  }}>Transfer</button>
                  <button className="btn-danger" onClick={async () => { if (confirm("O'chirilsinmi?")) { await api.delete(`/students/${student.id}`); load(); } }}>O'chirish</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing ? (
        <Modal title="O'quvchi ma'lumoti" onClose={() => setEditing(null)}>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="input" value={form.full_name || ""} onChange={(e) => setForm((v: any) => ({ ...v, full_name: e.target.value }))} placeholder="F.I.Sh" />
            <select className="input" value={form.group_id || ""} onChange={(e) => setForm((v: any) => ({ ...v, group_id: e.target.value }))}>
              <option value="">Guruh tanlang</option>
              {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
            </select>
            <input className="input" value={form.ota_phone || ""} onChange={(e) => setForm((v: any) => ({ ...v, ota_phone: e.target.value }))} placeholder="Ota telefoni" />
            <input className="input" value={form.ona_phone || ""} onChange={(e) => setForm((v: any) => ({ ...v, ona_phone: e.target.value }))} placeholder="Ona telefoni" />
            <input className="input" value={form.telefon || ""} onChange={(e) => setForm((v: any) => ({ ...v, telefon: e.target.value }))} placeholder="Telefon" />
            <select className="input" value={form.status || "active"} onChange={(e) => setForm((v: any) => ({ ...v, status: e.target.value }))}>
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
              <option value="debt">Qarzdor</option>
            </select>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setEditing(null)}>Bekor qilish</button>
            <button className="btn-primary" onClick={save}>Saqlash</button>
          </div>
        </Modal>
      ) : null}
      {profile ? (
        <Modal title={profile.student.full_name} onClose={() => setProfile(null)}>
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 p-4">Guruh: {profile.student.group_name || "-"}</div>
            <div>
              <div className="mb-3 font-semibold">To'lovlar</div>
              {profile.payments.map((payment: any) => <div key={payment.id} className="mb-2 rounded-2xl border border-white/10 p-3">{payment.month} | {payment.amount} so'm | {payment.paid ? "To'langan" : "To'lanmagan"}</div>)}
            </div>
            <div>
              <div className="mb-3 font-semibold">Davomat</div>
              {profile.attendance.slice(0, 10).map((item: any) => <div key={item.id} className="mb-2 rounded-2xl border border-white/10 p-3">{item.date} | {item.status}</div>)}
            </div>
          </div>
        </Modal>
      ) : null}
    </PageShell>
  );
}
