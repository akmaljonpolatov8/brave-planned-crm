export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="panel p-5">
      <div className="text-xs uppercase tracking-[0.25em] text-white/50">{label}</div>
      <div className="mt-3 text-3xl font-bold text-white">{value}</div>
      <div className="mt-2 text-sm text-white/60">{hint}</div>
    </div>
  );
}
