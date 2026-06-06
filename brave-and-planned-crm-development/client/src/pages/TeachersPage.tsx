import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { Modal } from "../components/Modal";
import { PageShell } from "../components/PageShell";
import { useAuth } from "../context/AuthContext";

type Teacher = { id: number; full_name: string; phone?: string; is_active?: number };

export function TeachersPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState({ full_name: "", phone: "" });

  const load = () => api.get("/teachers").then((res) => setTeachers(res.data));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.full_name) return toast.error("Ism kiritilsin");
    if (editing?.id) await api.put(`/teachers/${editing.id}`, form);
    else await api.post("/teachers", form);
    toast.success("O'qituvchi saqlandi");
    setEditing(null);
    setForm({ full_name: "", phone: "" });
    load();
  };

  return (
    <PageShell title="O'qituvchilar" description="O'qituvchilar va ularga biriktirilgan guruhlar."
      action={
        <button className="btn-primary" onClick={() => { setEditing({ id: 0, full_name: "" }); setForm({ full_name: "", phone: "" }); }}>
          Yangi o'qituvchi
        </button>
      }
    >
      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>To'liq ism</th>
              <th>Telefon</th>
              <th>Holat</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t, i) => (
              <tr key={t.id}>
                <td>{i + 1}</td>
                <td className="font-medium">{t.full_name}</td>
                <td className="text-white/60">{t.phone || "—"}</td>
                <td>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${t.is_active !== 0 ? "bg-green-500/15 text-green-400" : "bg-white/10 text-white/40"}`}>
                    {t.is_active !== 0 ? "Faol" : "Nofaol"}
                  </span>
                </td>
                <td className="space-x-2">
                  <button className="btn-secondary text-xs" onClick={() => { setEditing(t); setForm({ full_name: t.full_name, phone: t.phone || "" }); }}>Tahrirlash</button>
                  {user?.role === "owner" && (
                    <button className="btn-danger text-xs" onClick={async () => { if (confirm("O'chirilsinmi?")) { await api.delete(`/teachers/${t.id}`); load(); } }}>O'chirish</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing ? (
        <Modal title={editing.id ? "Tahrirlash" : "Yangi o'qituvchi"} onClose={() => setEditing(null)}>
          <div className="grid gap-4">
            <input className="input" value={form.full_name} onChange={(e) => setForm((v) => ({ ...v, full_name: e.target.value }))} placeholder="To'liq ism" />
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
