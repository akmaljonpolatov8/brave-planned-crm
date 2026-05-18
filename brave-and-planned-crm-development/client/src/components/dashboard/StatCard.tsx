import { useEffect, useState } from "react";

type StatCardTone = "gold" | "green" | "red" | "violet";

const toneClasses: Record<StatCardTone, string> = {
  gold: "text-[var(--gold)]",
  green: "text-[var(--green)]",
  red: "text-[var(--red)]",
  violet: "text-[var(--accent-light)]",
};

type StatCardProps = {
  title: string;
  value: number;
  subText: string;
  tone: StatCardTone;
  delayClass: string;
  formatter?: (value: number) => string;
};

function useCountUp(target: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const start = window.performance.now();

    const animate = (time: number) => {
      const progress = Math.min(1, (time - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        window.requestAnimationFrame(animate);
      }
    };

    window.requestAnimationFrame(animate);
  }, [target]);

  return value;
}

export function StatCard({
  title,
  value,
  subText,
  tone,
  delayClass,
  formatter,
}: StatCardProps) {
  const counted = useCountUp(value);
  const visibleValue = formatter
    ? formatter(counted)
    : counted.toLocaleString("uz-UZ");

  return (
    <article className={`stat-card bp-fadeup ${delayClass}`}>
      <p className="text-sm font-medium text-[var(--text-muted)]">{title}</p>
      <p
        className={`mt-4 text-[48px] font-bold leading-none ${toneClasses[tone]}`}
      >
        {visibleValue}
      </p>
      <p className="mt-4 text-sm text-[var(--text-muted)]">{subText}</p>
    </article>
  );
}
