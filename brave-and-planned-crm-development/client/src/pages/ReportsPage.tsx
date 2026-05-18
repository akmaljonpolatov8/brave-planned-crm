import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import api from "../api/axios";
import { PageShell } from "../components/PageShell";

export function ReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<any[]>([]);

  const load = async () => {
    const response = await api.get("/reports/weekly", { params: { from: from || undefined, to: to || undefined } });
    setRows(response.data.report);
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Brave and Planet Weekly Report", 14, 18);
    let y = 32;
    rows.forEach((row) => {
      doc.text(`${row.group_name}: Jami ${row.total_students}, Keldi ${row.present_count}, Kelmadi ${row.absent_count}, Foiz ${row.attendance_rate}%`, 14, y);
      y += 10;
    });
    doc.save("weekly-report.pdf");
  };

  useEffect(() => { load(); }, []);

  return (
    <PageShell title="Haftalik hisobot" description="Mon-Sun oralig'ida guruhlar kesimidagi attendance." action={<button className="btn-secondary" onClick={exportPdf}>Export PDF</button>}>
      <div className="panel mb-4 grid gap-4 p-4 md:grid-cols-3">
        <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button className="btn-primary" onClick={load}>Yangilash</button>
      </div>
      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Guruh</th>
              <th>Jami</th>
              <th>Keldi</th>
              <th>Kelmadi</th>
              <th>Foiz</th>
              <th>Grafik</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.group_id}>
                <td>{row.group_name}</td>
                <td>{row.total_students}</td>
                <td>{row.present_count}</td>
                <td>{row.absent_count}</td>
                <td>{row.attendance_rate}%</td>
                <td>
                  <div className="h-3 w-40 rounded-full bg-white/10">
                    <div className="h-3 rounded-full bg-[#46CFB0]" style={{ width: `${row.attendance_rate}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
