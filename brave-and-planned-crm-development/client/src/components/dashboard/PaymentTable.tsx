import { Badge } from "../ui/Badge";
import { Table } from "../ui/Table";

type Row = {
  id: number;
  full_name: string;
  group_name: string;
  amount: number;
  paid: number;
  status: "paid" | "unpaid" | "pending";
};

export function PaymentTable({ rows }: { rows: Row[] }) {
  return (
    <div className="page-stack">
      <h3>OXIRGI TO'LOVLAR</h3>
      <Table columns={["O'quvchi", "Guruh", "Summa", "Holat"]}>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.full_name}</td>
            <td>{row.group_name}</td>
            <td>{row.amount.toLocaleString("uz-UZ")}</td>
            <td>
              <Badge status={row.status}>
                {row.status === "paid"
                  ? "To'langan"
                  : row.status === "pending"
                    ? "Kutilmoqda"
                    : "Qarzdor"}
              </Badge>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
