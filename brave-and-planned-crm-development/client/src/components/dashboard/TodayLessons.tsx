type LessonRow = {
  name: string;
  time?: string | null;
  marked?: boolean;
  status?: string;
};

type TodayLessonsProps = {
  rows: LessonRow[];
};

function lessonState(row: LessonRow) {
  const status = (row.status || "").toLowerCase();
  if (status.includes("otkaz") || status.includes("o'tkaz")) {
    return { icon: "✗", label: "O'tkazildi", className: "text-[var(--red)]" };
  }
  if (row.marked || status.includes("belgi")) {
    return { icon: "✓", label: "Belgilandi", className: "text-[var(--green)]" };
  }
  return { icon: "●", label: "Kutilmoqda", className: "text-amber-300" };
}

export function TodayLessons({ rows }: TodayLessonsProps) {
  return (
    <section className="bp-panel bp-fadeup bp-delay-6 p-5">
      <h3 className="text-lg font-extrabold uppercase tracking-[0.16em] text-[var(--text-primary)]">
        Bugungi darslar
      </h3>

      <div className="mt-4 space-y-3">
        {rows.length ? (
          rows.map((row, index) => {
            const state = lessonState(row);
            return (
              <div
                key={`${row.name}-${index}`}
                className="flex items-center justify-between rounded-[10px] border border-[var(--border)] bg-white/5 px-3 py-3"
              >
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">
                    {row.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {row.time || "--:--"}
                  </p>
                </div>
                <p className={`text-sm font-semibold ${state.className}`}>
                  {state.icon} {state.label}
                </p>
              </div>
            );
          })
        ) : (
          <p className="rounded-[10px] border border-[var(--border)] bg-white/5 p-3 text-sm text-[var(--text-muted)]">
            Bugungi darslar topilmadi
          </p>
        )}
      </div>
    </section>
  );
}
