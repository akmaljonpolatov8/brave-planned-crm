import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { PageShell } from "../components/PageShell";

export function DebtorsPage() {
  const [rows, setRows] = useState<any[]>([]);

  const load = () => api.get("/debtors").then((res) => setRows(res.data));
  useEffect(() => { load(); }, []);

  return (
    <PageShell title="Qarzdorlar" description="Joriy oy to'lov qilmaganlar va SMS yuborish." action={<button className="btn-primary" onClick={async () => { await api.post("/debtors/send-all"); toast.success("Barchaga SMS yuborildi"); load(); }}>Barchaga SMS</button>}>
      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>O'quvchi</th>
              <th>Guruh</th>
              <th>Miqdor</th>
              <th>Kechikish</th>
              <th>Telefon</th>
              <th>Amal</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.payment_id}>
                <td>{row.full_name}</td>
                <td>{row.group_name}</td>
                <td>{row.amount} so'm</td>
                <td>{row.days_overdue} kun</td>
                <td>{row.parent_phone || "-"}</td>
                <td><button className="btn-secondary" onClick={async () => { await api.post(`/debtors/${row.payment_id}/send`); toast.success("SMS yuborildi"); }}>SMS yuborish</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
