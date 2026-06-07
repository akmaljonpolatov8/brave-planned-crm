import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { Modal } from "../Modal";

type GroupLike = {
  id: number;
  name?: string;
  teacher_id?: number | null;
  teacherId?: number | null;
  schedule_days?: string | null;
  scheduleDays?: string | null;
  start_time?: string | null;
  startTime?: string | null;
  end_time?: string | null;
  endTime?: string | null;
  monthly_fee?: number | null;
  monthlyFee?: number | null;
  capacity?: number | null;
  is_active?: number | null;
  isActive?: number | null;
};

type Teacher = {
  id: number;
  name?: string;
  full_name?: string;
};

const dayOptions = [
  { label: "Du", value: "Du" },
  { label: "Se", value: "Se" },
  { label: "Chor", value: "Chor" },
  { label: "Pay", value: "Pay" },
  { label: "Juma", value: "Juma" },
  { label: "Shan", value: "Shan" },
];

function splitDays(value?: string | null) {
  return (value || "")
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function teacherLabel(teacher: Teacher) {
  return teacher.name || teacher.full_name || "";
}

export function GroupEditModal({
  group,
  teachers,
  role,
  mode,
  onClose,
  onSaved,
}: {
  group: GroupLike;
  teachers: Teacher[];
  role: "owner" | "manager" | "teacher" | null | undefined;
  mode: "create" | "edit";
  onClose: () => void;
  onSaved: () => void;
}) {
  const isOwner = role === "owner";
  const [form, setForm] = useState({
    name: "",
    monthly_fee: 0,
    schedule_days: [] as string[],
    start_time: "",
    end_time: "",
    capacity: 20,
    teacher_id: "",
    is_active: 1,
  });

  useEffect(() => {
    setForm({
      name: group?.name || "",
      monthly_fee: Number(group?.monthly_fee ?? group?.monthlyFee ?? 0),
      schedule_days: splitDays(
        group?.schedule_days ?? group?.scheduleDays ?? "",
      ),
      start_time: group?.start_time ?? group?.startTime ?? "",
      end_time: group?.end_time ?? group?.endTime ?? "",
      capacity: Number(group?.capacity ?? 20),
      teacher_id: String(group?.teacher_id ?? group?.teacherId ?? ""),
      is_active: Number(group?.is_active ?? group?.isActive ?? 1),
    });
  }, [group]);

  const toggleDay = (value: string) => {
    setForm((current) => ({
      ...current,
      schedule_days: current.schedule_days.includes(value)
        ? current.schedule_days.filter((day) => day !== value)
        : [...current.schedule_days, value],
    }));
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Guruh nomi kiritilishi shart");
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        teacher_id: form.teacher_id ? Number(form.teacher_id) : null,
        schedule_days: form.schedule_days.join(","),
        start_time: form.start_time,
        end_time: form.end_time,
        monthly_fee: Number(form.monthly_fee) || 0,
        capacity: Number(form.capacity) || 20,
        is_active: isOwner ? form.is_active : undefined,
      };

      if (mode === "create") {
        await api.post("/groups", payload);
        toast.success("Guruh yaratildi ✓");
      } else {
        await api.put(`/groups/${group.id}`, payload);
        toast.success("Guruh yangilandi ✓");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
      console.error("Group save error:", err);
    }
  };

  return (
    <Modal title="Guruhni tahrirlash" onClose={onClose}>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="input"
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Guruh nomi"
        />
        <input
          className="input"
          type="number"
          value={form.monthly_fee}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              monthly_fee: Number(event.target.value),
            }))
          }
          placeholder="Oylik to'lov"
        />
        <input
          className="input"
          value={form.start_time}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              start_time: event.target.value,
            }))
          }
          placeholder="Boshlanish vaqti"
        />
        <input
          className="input"
          value={form.end_time}
          onChange={(event) =>
            setForm((current) => ({ ...current, end_time: event.target.value }))
          }
          placeholder="Tugash vaqti"
        />
        <input
          className="input"
          type="number"
          value={form.capacity}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              capacity: Number(event.target.value),
            }))
          }
          placeholder="Sig'im"
        />
        {isOwner ? (
          <select
            className="input"
            value={form.teacher_id}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                teacher_id: event.target.value,
              }))
            }
          >
            <option value="">O'qituvchi tanlang</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacherLabel(teacher)}
              </option>
            ))}
          </select>
        ) : null}
        {isOwner ? (
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/80">
            <input
              type="checkbox"
              checked={form.is_active === 1}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  is_active: event.target.checked ? 1 : 0,
                }))
              }
            />
            Faol guruh
          </label>
        ) : null}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 p-4">
        <div className="mb-3 text-sm font-semibold text-white/80">
          Hafta kunlari
        </div>
        <div className="flex flex-wrap gap-3">
          {dayOptions.map((day) => (
            <label
              key={day.value}
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/80"
            >
              <input
                type="checkbox"
                checked={form.schedule_days.includes(day.value)}
                onChange={() => toggleDay(day.value)}
              />
              {day.label}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button className="btn-secondary" onClick={onClose}>
          Bekor qilish
        </button>
        <button className="btn-primary" onClick={save}>
          Saqlash
        </button>
      </div>
    </Modal>
  );
}
