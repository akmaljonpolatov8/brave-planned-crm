type GroupRow = {
  id: number;
  name: string;
  total?: number;
  present_today?: number;
};

type GroupStatusProps = {
  rows: GroupRow[];
};

function progressClass(percent: number) {
  const rounded = Math.round(percent / 5) * 5;
  const clamped = Math.max(0, Math.min(100, rounded));
  return `bp-progress-${clamped}`;
}

function progressTone(percent: number) {
  if (percent >= 90) return "bp-progress-good";
  if (percent >= 70) return "bp-progress-mid";
  return "bp-progress-low";
}

export function GroupStatus({ rows }: GroupStatusProps) {
  return (
    <section className="bp-panel bp-fadeup bp-delay-5 p-5">
      <h3 className="text-lg font-extrabold uppercase tracking-[0.16em] text-[var(--text-primary)]">
        Guruhlar holati
      </h3>

      <div className="mt-4 space-y-4">
        {rows.length ? (
          rows.map((row) => {
            const current = row.present_today || 0;
            const total = row.total || 0;
            const percent = total ? Math.round((current / total) * 100) : 0;

            return (
              <div
                key={row.id}
                className="rounded-[10px] border border-[var(--border)] bg-white/5 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-[var(--text-primary)]">
                    {row.name}
                  </span>
                  <span className="text-sm font-semibold text-[var(--gold)]">
                    {current}/{total}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#3f2a71]">
                  <div
                    className={`bp-progress-fill ${progressClass(percent)} ${progressTone(percent)}`}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="rounded-[10px] border border-[var(--border)] bg-white/5 p-3 text-sm text-[var(--text-muted)]">
            Guruh holati ma'lumoti yo'q
          </p>
        )}
      </div>
    </section>
  );
}
