import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { Modal } from "../components/Modal";
import { PageShell } from "../components/PageShell";
import type { Group, Teacher } from "../types";

const emptyGroup = { name: "", teacher_id: "", course: "", schedule_time: "", schedule_days: "", monthly_fee: 0 };

export function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editing, setEditing] = useState<Group | null>(null);
  const [form, setForm] = useState<any>(emptyGroup);

  const load = async () => {
    const [groupRes, teacherRes] = await Promise.all([api.get("/groups"), api.get("/teachers")]);
    setGroups(groupRes.data);
    setTeachers(teacherRes.data);
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.name) return toast.error("Guruh nomi kiritilsin");
    if (editing?.id) await api.put(`/groups/${editing.id}`, form);
    else await api.post("/groups", form);
    toast.success("Guruh saqlandi");
    setEditing(null);
    setForm(emptyGroup);
    load();
  };

  return (
    <PageShell title="Guruhlar" description="Guruhlar ro'yxati, jadval, o'qituvchi va attendance boshqaruvi." action={<button className="btn-primary" onClick={() => { setEditing({ id: 0, name: "", student_count: 0 }); setForm(emptyGroup); }}>Yangi guruh</button>}>
      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map((group) => (
          <div key={group.id} className="panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display text-2xl">{group.name}</div>
                <div className="mt-2 text-sm text-white/60">{group.schedule_time} | {group.schedule_days}</div>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 text-xs">{group.monthly_fee || 0} so'm</div>
            </div>
            <div className="mt-4 text-sm text-white/70">O'qituvchi: {group.teacher_name || "Biriktirilmagan"}</div>
            <div className="mt-2 text-sm text-white/70">O'quvchilar: {group.student_count || 0}</div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className="btn-secondary" to={`/groups/${group.id}`}>Ko'rish</Link>
              <button className="btn-secondary" onClick={() => { setEditing(group); setForm(group); }}>Tahrirlash</button>
              <button className="btn-danger" onClick={async () => { if (confirm("O'chirilsinmi?")) { await api.delete(`/groups/${group.id}`); load(); } }}>O'chirish</button>
            </div>
          </div>
        ))}
      </div>
      {editing ? (
        <Modal title="Guruh ma'lumoti" onClose={() => setEditing(null)}>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="input" value={form.name || ""} onChange={(e) => setForm((v: any) => ({ ...v, name: e.target.value }))} placeholder="Guruh nomi" />
            <select className="input" value={form.teacher_id || ""} onChange={(e) => setForm((v: any) => ({ ...v, teacher_id: e.target.value }))}>
              <option value="">O'qituvchi tanlang</option>
              {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
            </select>
            <input className="input" value={form.course || ""} onChange={(e) => setForm((v: any) => ({ ...v, course: e.target.value }))} placeholder="Kurs" />
            <input className="input" value={form.schedule_time || ""} onChange={(e) => setForm((v: any) => ({ ...v, schedule_time: e.target.value }))} placeholder="Vaqt" />
            <input className="input" value={form.schedule_days || ""} onChange={(e) => setForm((v: any) => ({ ...v, schedule_days: e.target.value }))} placeholder="Kunlar" />
            <input className="input" type="number" value={form.monthly_fee || 0} onChange={(e) => setForm((v: any) => ({ ...v, monthly_fee: Number(e.target.value) }))} placeholder="Oylik to'lov" />
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setEditing(null)}>Bekor qilish</button>
            <button className="btn-primary" onClick={submit}>Saqlash</button>
          </div>
        </Modal>
      ) : null}
    </PageShell>
  );
}
