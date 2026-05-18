type Row = {
  id: number;
  name: string;
  time: string;
  marked: boolean;
  status: string;
};

export function TodayAttendance({ rows }: { rows: Row[] }) {
  return (
    <section className="bp-card card-pad">
      <h3>BUGUNGI ATTENDANCE</h3>
      <div className="page-stack" style={{ marginTop: 16 }}>
        {rows.map((row) => (
          <div key={row.id} className="page-header">
            <div>
              <strong>{row.name}</strong> {row.time ? `- ${row.time}` : ""}
            </div>
            <div style={{ color: row.marked ? "var(--success)" : "var(--warning)" }}>
              {row.marked ? "✓ Belgilandi" : "● Kutilmoqda"}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
