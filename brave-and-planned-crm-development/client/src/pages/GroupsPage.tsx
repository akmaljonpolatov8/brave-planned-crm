import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { useAuth } from "../context/AuthContext";
import { canManage, isOwner } from "../lib/permissions";

type Group = {
  id: number;
  name: string;
  teacher_id: number | null;
  teacher_name?: string;
  schedule_days: string;
  start_time: string;
  end_time: string;
  monthly_fee: number;
  student_count: number;
};

type Teacher = {
  id: number;
  full_name: string;
};

type Student = {
  id: number;
  full_name: string;
};

const emptyForm = {
  name: "",
  teacher_id: "",
  schedule_days: "",
  start_time: "",
  end_time: "",
  monthly_fee: 0,
};

export function GroupsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [groupStudents, setGroupStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [studentToAdd, setStudentToAdd] = useState("");
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const [groupsResponse, teachersResponse, studentsResponse] = await Promise.all([
      api.get<Group[]>("/groups"),
      api.get<Teacher[]>("/teachers"),
      api.get<Student[]>("/students"),
    ]);
    setRows(groupsResponse.data);
    setTeachers(teachersResponse.data);
    setStudents(studentsResponse.data);
  };

  useEffect(() => {
    load();
  }, []);

  const openViewer = async (group: Group) => {
    setSelectedGroup(group);
    const response = await api.get<Student[]>(`/groups/${group.id}/students`);
    setGroupStudents(response.data);
    setViewerOpen(true);
  };

  const save = async () => {
    const payload = {
      ...form,
      teacher_id: form.teacher_id ? Number(form.teacher_id) : null,
      monthly_fee: Number(form.monthly_fee),
    };
    if (selectedGroup && open) {
      await api.put(`/groups/${selectedGroup.id}`, payload);
    } else {
      await api.post("/groups", payload);
    }
    toast.success("Guruh saqlandi");
    setOpen(false);
    setSelectedGroup(null);
    setForm(emptyForm);
    await load();
  };

  return (
    <div className="page-stack">
      <div className="toolbar">
        <div>
          <h1>Guruhlar</h1>
          <p>Kartalar ko'rinishi, o'qituvchi va oylik to'lov nazorati</p>
        </div>
        {canManage(user) ? (
          <Button
            onClick={() => {
              setSelectedGroup(null);
              setForm(emptyForm);
              setOpen(true);
            }}
          >
            Yangi guruh
          </Button>
        ) : null}
      </div>

      <section className="stats-grid">
        {rows.map((row) => (
          <article key={row.id} className="bp-card card-pad">
            <div className="page-stack">
              <h3>{row.name}</h3>
              <div>O'qituvchi: {row.teacher_name || "Biriktirilmagan"}</div>
              <div>
                {row.start_time} - {row.end_time} | {row.schedule_days}
              </div>
              <div>O'quvchilar soni: {row.student_count}/40</div>
              {canManage(user) ? (
                <div>Oylik to'lov: {row.monthly_fee.toLocaleString("uz-UZ")} so'm</div>
              ) : null}
              <div className="btn-row">
                <Button variant="secondary" onClick={() => openViewer(row)}>
                  Ko'rish
                </Button>
                {canManage(user) ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedGroup(row);
                      setForm({
                        name: row.name,
                        teacher_id: row.teacher_id ? String(row.teacher_id) : "",
                        schedule_days: row.schedule_days || "",
                        start_time: row.start_time || "",
                        end_time: row.end_time || "",
                        monthly_fee: row.monthly_fee || 0,
                      });
                      setOpen(true);
                    }}
                  >
                    Tahrirlash
                  </Button>
                ) : null}
                {isOwner(user) ? (
                  <Button
                    variant="danger"
                    onClick={async () => {
                      await api.delete(`/groups/${row.id}`);
                      toast.success("Guruh o'chirildi");
                      await load();
                    }}
                  >
                    O'chirish
                  </Button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </section>

      <Modal
        open={open}
        title={selectedGroup ? "Guruhni tahrirlash" : "Yangi guruh"}
        onClose={() => setOpen(false)}
      >
        <div className="form-grid">
          <label className="form-label">
            Guruh nomi
            <input
              className="bp-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <div className="form-two">
            <label className="form-label">
              O'qituvchi
              <select
                className="bp-select"
                value={form.teacher_id}
                onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
              >
                <option value="">Tanlanmagan</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.full_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-label">
              Hafta kunlari
              <input
                className="bp-input"
                value={form.schedule_days}
                onChange={(e) => setForm({ ...form, schedule_days: e.target.value })}
                placeholder="Du,Chor,Juma"
              />
            </label>
          </div>
          <div className="form-two">
            <label className="form-label">
              Boshlanish
              <input
                className="bp-input"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                placeholder="14:00"
              />
            </label>
            <label className="form-label">
              Tugash
              <input
                className="bp-input"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                placeholder="16:00"
              />
            </label>
          </div>
          <label className="form-label">
            Oylik to'lov
            <input
              className="bp-input"
              type="number"
              value={form.monthly_fee}
              onChange={(e) => setForm({ ...form, monthly_fee: Number(e.target.value) })}
            />
          </label>
          <Button onClick={save}>Saqlash</Button>
        </div>
      </Modal>

      <Modal
        open={viewerOpen}
        title={selectedGroup ? `${selectedGroup.name} o'quvchilari` : "Guruh"}
        onClose={() => setViewerOpen(false)}
      >
        <div className="page-stack">
          {canManage(user) && selectedGroup ? (
            <div className="form-two">
              <select
                className="bp-select"
                value={studentToAdd}
                onChange={(e) => setStudentToAdd(e.target.value)}
              >
                <option value="">O'quvchini tanlang</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name}
                  </option>
                ))}
              </select>
              <Button
                onClick={async () => {
                  if (!studentToAdd) return;
                  await api.post(`/groups/${selectedGroup.id}/students`, {
                    student_id: Number(studentToAdd),
                  });
                  toast.success("O'quvchi guruhga qo'shildi");
                  await openViewer(selectedGroup);
                }}
              >
                Qo'shish
              </Button>
            </div>
          ) : null}
          {groupStudents.length ? (
            <div className="page-stack">
              {groupStudents.map((student) => (
                <div key={student.id} className="bp-card card-pad">
                  {student.full_name}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">Bu guruhda o'quvchi yo'q</div>
          )}
        </div>
      </Modal>
    </div>
  );
}
