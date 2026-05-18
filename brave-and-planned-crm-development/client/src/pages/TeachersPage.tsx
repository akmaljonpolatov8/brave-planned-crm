import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
import { useAuth } from "../context/AuthContext";
import { canManage, isOwner } from "../lib/permissions";

type Teacher = {
  id: number;
  full_name: string;
  phone: string;
  username: string;
  is_active: number;
  group_count: number;
};

const emptyForm = {
  full_name: "",
  phone: "",
  username: "",
  password: "",
  is_active: 1,
};

export function TeachersPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Teacher[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const response = await api.get<Teacher[]>("/teachers");
    setRows(response.data);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (editing) {
      await api.put(`/teachers/${editing.id}`, form);
    } else {
      await api.post("/teachers", form);
    }
    toast.success("Saqlandi");
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    await load();
  };

  return (
    <div className="page-stack">
      <div className="toolbar">
        <div>
          <h1>O'qituvchilar</h1>
          <p>Teacher akkauntlari va guruh birikmalari</p>
        </div>
        {canManage(user) ? (
          <Button onClick={() => setOpen(true)}>Yangi o'qituvchi</Button>
        ) : null}
      </div>

      <Table columns={["Ism", "Telefon", "Username", "Guruhlar", "Holat", "Amal"]}>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.full_name}</td>
            <td>{row.phone || "—"}</td>
            <td>{row.username || "—"}</td>
            <td>{row.group_count}</td>
            <td>{row.is_active ? "Faol" : "Noaktiv"}</td>
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
                        username: row.username || "",
                        password: "",
                        is_active: row.is_active,
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
                      await api.delete(`/teachers/${row.id}`);
                      toast.success("O'qituvchi o'chirildi");
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
        title={editing ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi"}
        onClose={() => setOpen(false)}
      >
        <div className="form-grid">
          <div className="form-two">
            <label className="form-label">
              Ism
              <input
                className="bp-input"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </label>
            <label className="form-label">
              Telefon
              <input
                className="bp-input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
          </div>
          <div className="form-two">
            <label className="form-label">
              Username
              <input
                className="bp-input"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </label>
            <label className="form-label">
              Parol
              <input
                className="bp-input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
          </div>
          <Button onClick={save}>Saqlash</Button>
        </div>
      </Modal>
    </div>
  );
}
