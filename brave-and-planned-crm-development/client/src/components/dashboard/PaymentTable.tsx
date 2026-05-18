type PaymentRow = {
  full_name: string;
  group_name?: string | null;
  amount: number;
  paid: number;
  status?: "paid" | "unpaid" | "pending";
};

type PaymentTableProps = {
  rows: PaymentRow[];
};

type BadgeKey = "tolangan" | "qarzdor" | "kutilmoqda";

const badgeMap: Record<BadgeKey, { className: string; label: string }> = {
  tolangan: { className: "bp-badge-tolangan", label: "To'langan" },
  qarzdor: { className: "bp-badge-qarzdor", label: "Qarzdor" },
  kutilmoqda: { className: "bp-badge-kutilmoqda", label: "Kutilmoqda" },
};

function getBadge(row: PaymentRow) {
  if (row.status === "pending") return badgeMap.kutilmoqda;
  if (row.paid) return badgeMap.tolangan;
  return badgeMap.qarzdor;
}

export function PaymentTable({ rows }: PaymentTableProps) {
  return (
    <section className="bp-panel bp-fadeup bp-delay-4 overflow-hidden p-0">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <h3 className="text-lg font-extrabold uppercase tracking-[0.16em] text-[var(--text-primary)]">
          Oxirgi to'lovlar
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="bp-th">O'quvchi</th>
              <th className="bp-th">Guruh</th>
              <th className="bp-th">Summa</th>
              <th className="bp-th">Holat</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, index) => {
                const badge = getBadge(row);
                return (
                  <tr
                    key={`${row.full_name}-${index}`}
                    className="border-t border-[var(--border)]/60"
                  >
                    <td className="bp-td font-semibold text-[var(--text-primary)]">
                      {row.full_name}
                    </td>
                    <td className="bp-td text-[var(--text-muted)]">
                      {row.group_name || "-"}
                    </td>
                    <td className="bp-td text-[var(--gold)]">
                      {row.amount.toLocaleString("uz-UZ")} so'm
                    </td>
                    <td className="bp-td">
                      <span className={`bp-badge ${badge.className}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="bp-td py-10 text-center text-[var(--text-muted)]"
                >
                  Hozircha to'lovlar yo'q
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
