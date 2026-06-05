import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { Modal } from "../Modal";

type Group = {
  id: number;
  name: string;
  is_active?: number | null;
};

type Student = {
  id: number;
  full_name: string;
  groups?: string | string[];
  group_name?: string | null;
};

function normalizeGroups(groups?: string | string[] | null) {
  if (Array.isArray(groups)) return groups.filter(Boolean);
  if (!groups) return [];
  return String(groups)
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function TransferModal({
  student,
  groups,
  role,
  onClose,
  onSaved,
}: {
  student: Student;
  groups: Group[];
  role: "owner" | "manager" | "teacher" | null | undefined;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [fromGroupId, setFromGroupId] = useState("");
  const [toGroupId, setToGroupId] = useState("");

  const currentGroupNames = useMemo(
    () => normalizeGroups(student.groups || student.group_name),
    [student],
  );
  const currentGroups = useMemo(
    () => groups.filter((group) => currentGroupNames.includes(group.name)),
    [groups, currentGroupNames],
  );
  const destinationGroups = useMemo(
    () =>
      groups.filter(
        (group) => String(group.id) !== fromGroupId && group.is_active !== 0,
      ),
    [groups, fromGroupId],
  );

  const submit = async () => {
    if (!fromGroupId) return toast.error("Qaysi guruhdan tanlang");
    if (!toGroupId) return toast.error("Qaysi guruhga tanlang");

    await api.post(`/students/${student.id}/transfer`, {
      studentId: student.id,
      fromGroupId,
      toGroupId,
      from_group_id: fromGroupId,
      to_group_id: toGroupId,
    });

    toast.success(`O'quvchi ${student.full_name} guruhdan ko'chirildi`);
    onSaved();
    onClose();
  };

  if (role !== "owner" && role !== "manager") return null;

  return (
    <Modal title="O'quvchini ko'chirish" onClose={onClose}>
      <div className="space-y-5">
        <div>
          <div className="text-sm text-white/50">O'quvchi</div>
          <div className="mt-1 text-lg font-semibold text-white">
            {student.full_name}
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm text-white/50">Joriy guruhlar</div>
          <div className="flex flex-wrap gap-2">
            {currentGroups.length ? (
              currentGroups.map((group) => (
                <span
                  key={group.id}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80"
                >
                  {group.name}
                </span>
              ))
            ) : (
              <span className="text-sm text-white/50">Guruh topilmadi</span>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <select
            className="input"
            value={fromGroupId}
            onChange={(event) => {
              setFromGroupId(event.target.value);
              setToGroupId("");
            }}
          >
            <option value="">Qaysi guruhdan</option>
            {currentGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={toGroupId}
            onChange={(event) => setToGroupId(event.target.value)}
          >
            <option value="">Qaysi guruhga</option>
            {destinationGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button className="btn-secondary" onClick={onClose}>
            Bekor qilish
          </button>
          <button className="btn-primary" onClick={submit}>
            Ko'chirish
          </button>
        </div>
      </div>
    </Modal>
  );
}
