import type { Payment } from "../types";

export function PaymentTable({
  rows,
  onPaid,
  onEdit,
}: {
  rows: Payment[];
  onPaid: (id: number) => void;
  onEdit: (row: Payment) => void;
}) {
  return (
    <div className="table-shell">
      <table>
        <thead>
          <tr>
            <th>O'quvchi</th>
            <th>Miqdor</th>
            <th>Holat</th>
            <th>Amal</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.full_name}</td>
              <td>{row.amount} so'm</td>
              <td>{row.paid ? "To'langan" : "To'lanmagan"}</td>
              <td className="space-x-2">
                <button className="btn-secondary" onClick={() => onPaid(row.id)}>
                  To'landi
                </button>
                <button className="btn-secondary" onClick={() => onEdit(row)}>
                  Tahrirlash
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
