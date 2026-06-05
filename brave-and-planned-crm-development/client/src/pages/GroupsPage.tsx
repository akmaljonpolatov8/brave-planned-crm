import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { GroupEditModal } from "../components/groups/GroupEditModal";
import { PageShell } from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import type { Group, Teacher } from "../types";

const emptyGroup = {
  name: "",
  teacher_id: "",
  course: "",
  schedule_time: "",
  schedule_days: "",
  monthly_fee: 0,
};

export function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editing, setEditing] = useState<Group | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<any>(emptyGroup);

  const load = async () => {
    const [groupRes, teacherRes] = await Promise.all([
      api.get("/groups"),
      api.get("/teachers"),
    ]);
    setGroups(groupRes.data);
    setTeachers(teacherRes.data);
  };
  useEffect(() => {
    load();
  }, []);

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
    <PageShell
      title="Guruhlar"
      description="Guruhlar ro'yxati, jadval, o'qituvchi va attendance boshqaruvi."
      action={
        <button
          className="btn-primary"
          onClick={() => {
            setCreating(true);
            setForm(emptyGroup);
          }}
        >
          Yangi guruh
        </button>
      }
    >
      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map((group) => (
          <div key={group.id} className="panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display text-2xl">{group.name}</div>
                <div className="mt-2 text-sm text-white/60">
                  {group.schedule_time} | {group.schedule_days}
                </div>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 text-xs">
                {group.monthly_fee || 0} so'm
              </div>
            </div>
            <div className="mt-4 text-sm text-white/70">
              O'qituvchi: {group.teacher_name || "Biriktirilmagan"}
            </div>
            <div className="mt-2 text-sm text-white/70">
              O'quvchilar: {group.student_count || 0}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className="btn-secondary" to={`/groups/${group.id}`}>
                Ko'rish
              </Link>
              {user?.role === "owner" || user?.role === "manager" ? (
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setEditing(group);
                    setForm(group);
                  }}
                >
                  Tahrirlash
                </button>
              ) : null}
              <button
                className="btn-danger"
                onClick={async () => {
                  if (confirm("O'chirilsinmi?")) {
                    await api.delete(`/groups/${group.id}`);
                    load();
                  }
                }}
              >
                O'chirish
              </button>
            </div>
          </div>
        ))}
      </div>
      {editing ? (
        <GroupEditModal
          group={editing}
          teachers={teachers}
          role={user?.role || null}
          mode="edit"
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      ) : null}
      {creating ? (
        <GroupEditModal
          group={{ id: 0, name: "" } as Group}
          teachers={teachers}
          role={user?.role || null}
          mode="create"
          onClose={() => setCreating(false)}
          onSaved={load}
        />
      ) : null}
    </PageShell>
  );
}
