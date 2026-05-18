import { useLocation } from "react-router-dom";
import { PageShell } from "../components/PageShell";

export function SearchPage() {
  const location = useLocation() as { state?: { results?: any[]; query?: string } };
  const results = location.state?.results || [];
  const query = location.state?.query || "";

  return (
    <PageShell title="Qidiruv natijalari" description={`"${query}" bo'yicha topilgan o'quvchilar.`}>
      <div className="table-shell">
        <table>
          <thead><tr><th>F.I.Sh</th><th>Guruh</th><th>To'lov holati</th><th>Telefon</th></tr></thead>
          <tbody>
            {results.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.group}</td>
                <td>{item.paymentStatus}</td>
                <td>{item.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
