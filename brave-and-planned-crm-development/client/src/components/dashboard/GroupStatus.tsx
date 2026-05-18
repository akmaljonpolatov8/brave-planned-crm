type Row = {
  id: number;
  name: string;
  total: number;
  present_today: number;
};

export function GroupStatus({ rows }: { rows: Row[] }) {
  return (
    <section className="bp-card card-pad">
      <h3>GURUHLAR HOLATI</h3>
      <div className="page-stack" style={{ marginTop: 16 }}>
        {rows.map((row) => {
          const total = Number(row.total) || 0;
          const current = Number(row.present_today) || 0;
          const ratio = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
          return (
            <div key={row.id}>
              <div className="page-header">
                <strong>{row.name}</strong>
                <span>
                  {current}/{total}
                </span>
              </div>
              <div className="progress-track" style={{ marginTop: 10 }}>
                <div className="progress-fill" style={{ width: `${ratio}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
