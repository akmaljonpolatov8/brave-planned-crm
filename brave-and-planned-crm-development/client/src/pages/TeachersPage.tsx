import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { Modal } from "../components/Modal";
import { PageShell } from "../components/PageShell";
import type { Teacher } from "../types";

export function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState({ name: "", phone: "" });

  const load = () => api.get("/teachers").then((res) => setTeachers(res.data));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.name) return toast.error("Ism kiritilsin");
    if (editing?.id) await api.put(`/teachers/${editing.id}`, form);
    else await api.post("/teachers", form);
    toast.success("O'qituvchi saqlandi");
    setEditing(null);
    setForm({ name: "", phone: "" });
    load();
  };

  return (
    <PageShell title="O'qituvchilar" description="O'qituvchilar va ularga biriktirilgan guruhlar.">
      <div className="mb-4">
        <button className="btn-primary" onClick={() => { setEditing({ id: 0, name: "", phone: "" }); setForm({ name: "", phone: "" }); }}>
          Yangi o'qituvchi
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="panel p-5">
            <div className="font-semibold">{teacher.name}</div>
            <div className="mt-2 text-sm text-white/60">{teacher.phone || "Telefon kiritilmagan"}</div>
            <div className="mt-2 text-sm text-white/60">{teacher.group_count || 0} ta guruh</div>
            <div className="mt-4 flex gap-3">
              <button className="btn-secondary" onClick={() => { setEditing(teacher); setForm({ name: teacher.name, phone: teacher.phone || "" }); }}>Tahrirlash</button>
              <button className="btn-danger" onClick={async () => { if (confirm("O'chirilsinmi?")) { await api.delete(`/teachers/${teacher.id}`); load(); } }}>O'chirish</button>
            </div>
          </div>
        ))}
      </div>
      {editing ? (
        <Modal title="O'qituvchi" onClose={() => setEditing(null)}>
          <div className="grid gap-4">
            <input className="input" value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} placeholder="Ism" />
            <input className="input" value={form.phone} onChange={(e) => setForm((v) => ({ ...v, phone: e.target.value }))} placeholder="Telefon" />
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
