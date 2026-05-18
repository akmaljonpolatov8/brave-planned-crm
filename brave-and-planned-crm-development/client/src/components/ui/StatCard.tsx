import { useEffect, useState } from "react";

function useCountUp(target: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    let raf = 0;

    const tick = (time: number) => {
      const progress = Math.min(1, (time - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return value;
}

export function StatCard({
  title,
  value,
  note,
  formatter,
}: {
  title: string;
  value: number;
  note: string;
  formatter?: (value: number) => string;
}) {
  const counted = useCountUp(value);
  const display = formatter ? formatter(counted) : counted.toLocaleString("uz-UZ");

  return (
    <article className="stat-card bp-fadeup">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{display}</div>
      <div className="stat-note">{note}</div>
    </article>
  );
}
