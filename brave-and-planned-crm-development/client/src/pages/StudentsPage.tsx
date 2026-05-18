import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
import { useAuth } from "../context/AuthContext";
import { canManage, isOwner } from "../lib/permissions";

type Student = {
  id: number;
  full_name: string;
  phone: string;
  parent_phone: string;
  parent_name: string;
  status: string;
  notes: string;
  group_name?: string;
  group_id?: number;
};

const emptyForm = {
  full_name: "",
  phone: "",
  parent_phone: "",
  parent_name: "",
  status: "active",
  notes: "",
};

export function StudentsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const response = await api.get<Student[]>("/students");
    setRows(response.data);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (editing) {
      await api.put(`/students/${editing.id}`, form);
      toast.success("O'quvchi yangilandi");
    } else {
      await api.post("/students", form);
      toast.success("O'quvchi qo'shildi");
    }
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    await load();
  };

  return (
    <div className="page-stack">
      <div className="toolbar">
        <div>
          <h1>O'quvchilar</h1>
          <p>Ro'yxat, kontakt va guruh birikmalari</p>
        </div>
        {canManage(user) ? (
          <Button
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
              setOpen(true);
            }}
          >
            Yangi o'quvchi
          </Button>
        ) : null}
      </div>

      <Table columns={["F.I.SH", "Telefon", "Ota-ona", "Guruh", "Status", "Amal"]}>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.full_name}</td>
            <td>{row.phone || "—"}</td>
            <td>{row.parent_phone || "—"}</td>
            <td>{row.group_name || "Biriktirilmagan"}</td>
            <td>{row.status}</td>
            <td>
              <div className="btn-row">
                {canManage(user) ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditing(row);
                      setForm({
                        full_name: row.full_name,
                        phone: row.phone || "",
                        parent_phone: row.parent_phone || "",
                        parent_name: row.parent_name || "",
                        status: row.status,
                        notes: row.notes || "",
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
                      await api.delete(`/students/${row.id}`);
                      toast.success("O'quvchi o'chirildi");
                      await load();
                    }}
                  >
                    O'chirish
                  </Button>
                ) : null}
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Modal
        open={open}
        title={editing ? "O'quvchini tahrirlash" : "Yangi o'quvchi"}
        onClose={() => setOpen(false)}
      >
        <div className="form-grid">
          <label className="form-label">
            F.I.SH
            <input
              className="bp-input"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </label>
          <div className="form-two">
            <label className="form-label">
              Telefon
              <input
                className="bp-input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
            <label className="form-label">
              Ota-ona telefoni
              <input
                className="bp-input"
                value={form.parent_phone}
                onChange={(e) => setForm({ ...form, parent_phone: e.target.value })}
              />
            </label>
          </div>
          <label className="form-label">
            Ota-ona ismi
            <input
              className="bp-input"
              value={form.parent_name}
              onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
            />
          </label>
          <label className="form-label">
            Status
            <select
              className="bp-select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="frozen">frozen</option>
            </select>
          </label>
          <label className="form-label">
            Izoh
            <textarea
              className="bp-textarea"
              rows={4}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>
          <Button onClick={save}>Saqlash</Button>
        </div>
      </Modal>
    </div>
  );
}
