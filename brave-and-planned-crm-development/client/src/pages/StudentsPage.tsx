import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil, ArrowRightLeft, Trash2 } from "lucide-react";
import api from "../api/axios";
import { Modal } from "../components/Modal";
import { PageShell } from "../components/PageShell";
import { SearchBar } from "../components/SearchBar";
import { TransferModal } from "../components/students/TransferModal";
import { useAuth } from "../context/AuthContext";
import type { Group, Student } from "../types";

const emptyForm = {
  full_name: "",
  phone: "",
  parent_phone: "",
  parent_name: "",
  status: "active",
  notes: "",
};

const splitGroupNames = (value: unknown) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export function StudentsPage() {
  const location = useLocation() as {
    state?: { searchResults?: Student[]; searchQuery?: string };
  };
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>(
    location.state?.searchResults || [],
  );
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState(location.state?.searchQuery || "");
  const [editing, setEditing] = useState<Student | null>(null);
  const [transferring, setTransferring] = useState<Student | null>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const load = async () => {
    const [studentsRes, groupsRes] = await Promise.all([
      api.get("/students", { params: { search } }),
      api.get("/groups"),
    ]);
    setStudents(studentsRes.data);
    setGroups(groupsRes.data);
  };

  useEffect(() => {
    load();
  }, [search]);

  const save = async () => {
    if (!form.full_name) return toast.error("F.I.Sh kiritilsin");
    try {
      if (editing?.id) {
        await api.put(`/students/${editing.id}`, form);
        toast.success("O'quvchi yangilandi ✓");
      } else {
        await api.post("/students", form);
        toast.success("O'quvchi yaratildi ✓");
      }
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
      console.error("Student save error:", err);
    }
  };

  return (
    <PageShell
      title="O'quvchilar"
      description="Live search, profil, davomat va transfer boshqaruvi."
      action={
        <button
          className="btn-primary"
          onClick={() => {
            setEditing({ id: 0, full_name: "", status: "active" } as Student);
            setForm(emptyForm);
          }}
        >
          Yangi o'quvchi
        </button>
      }
    >
      <div className="panel p-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="F.I.Sh bo'yicha qidirish"
        />
      </div>
      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Ism Familiya</th>
              <th>Telefon</th>
              <th>Guruhlar</th>
              <th>Holat</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id}>
                <td>{index + 1}</td>
                <td>{student.full_name}</td>
                <td>
                  {student.phone ||
                    student.parent_phone ||
                    "—"}
                </td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    {splitGroupNames(
                      (student as any).groups || student.group_name,
                    ).length ? (
                      splitGroupNames(
                        (student as any).groups || student.group_name,
                      ).map((groupName: string) => (
                        <span
                          key={groupName}
                          className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80"
                        >
                          {groupName}
                        </span>
                      ))
                    ) : (
                      <span className="text-white/50">-</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    student.status === "active" ? "bg-green-500/15 text-green-400" :
                    student.status === "inactive" ? "bg-white/10 text-white/40" :
                    "bg-blue-500/15 text-blue-400"
                  }`}>
                    {student.status === "active" ? "Faol" : student.status === "inactive" ? "Nofaol" : "Bitiruvchi"}
                  </span>
                </td>
                <td className="space-x-2">
                  {user?.role === "owner" || user?.role === "manager" ? (
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setEditing(student);
                        setForm({
                          full_name: student.full_name || "",
                          phone: (student as any).phone || "",
                          parent_phone: (student as any).parent_phone || "",
                          parent_name: (student as any).parent_name || "",
                          status: student.status || "active",
                          notes: (student as any).notes || "",
                        });
                      }}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Pencil size={16} /> Tahrirlash
                      </span>
                    </button>
                  ) : null}
                  {user?.role === "owner" || user?.role === "manager" ? (
                    <button
                      className="btn-secondary"
                      onClick={() => setTransferring(student)}
                    >
                      <span className="inline-flex items-center gap-2">
                        <ArrowRightLeft size={16} /> Ko'chirish
                      </span>
                    </button>
                  ) : null}
                  {user?.role === "owner" ? (
                    <button
                      className="btn-danger"
                      onClick={async () => {
                        if (confirm("O'chirilsinmi?")) {
                          await api.delete(`/students/${student.id}`);
                          load();
                        }
                      }}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Trash2 size={16} /> O'chirish
                      </span>
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing ? (
        <Modal title="O'quvchi ma'lumoti" onClose={() => setEditing(null)}>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="input"
              value={form.full_name || ""}
              onChange={(e) =>
                setForm((v: any) => ({ ...v, full_name: e.target.value }))
              }
              placeholder="F.I.Sh"
            />
            <select
              className="input"
              value={form.group_id || ""}
              onChange={(e) =>
                setForm((v: any) => ({ ...v, group_id: e.target.value }))
              }
            >
              <option value="">Guruh tanlang</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <input
              className="input"
              value={form.phone || ""}
              onChange={(e) =>
                setForm((v: any) => ({ ...v, phone: e.target.value }))
              }
              placeholder="Telefon raqami"
            />
            <input
              className="input"
              value={form.parent_phone || ""}
              onChange={(e) =>
                setForm((v: any) => ({ ...v, parent_phone: e.target.value }))
              }
              placeholder="Ota-ona telefoni"
            />
            <input
              className="input"
              value={form.parent_name || ""}
              onChange={(e) =>
                setForm((v: any) => ({ ...v, parent_name: e.target.value }))
              }
              placeholder="Ota-ona ismi"
            />
            <select
              className="input"
              value={form.status || "active"}
              onChange={(e) =>
                setForm((v: any) => ({ ...v, status: e.target.value }))
              }
            >
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
              <option value="debt">Qarzdor</option>
            </select>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setEditing(null)}>
              Bekor qilish
            </button>
            <button className="btn-primary" onClick={save}>
              Saqlash
            </button>
          </div>
        </Modal>
      ) : null}
      {transferring ? (
        <TransferModal
          student={transferring as any}
          groups={groups as any}
          role={user?.role || null}
          onClose={() => setTransferring(null)}
          onSaved={load}
        />
      ) : null}
    </PageShell>
  );
}
