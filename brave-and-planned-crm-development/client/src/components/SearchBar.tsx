import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

export function SearchBar({ value, onChange, placeholder = "Qidirish" }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")) {
        e.preventDefault(); ref.current?.focus();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <div className="relative group w-full">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-[var(--gold)]" />
      <input ref={ref} type="text" role="searchbox" aria-label="Qidirish" className="input !pl-12 !pr-24" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
        {value && (
          <button onClick={() => { onChange(""); ref.current?.focus(); }} className="p-1 hover:bg-white/10 rounded-lg text-white/40 hover:text-white" aria-label="Tozalash" title="Tozalash">
            <X size={18} />
          </button>
        )}
        <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] text-white/40">Ctrl+K</kbd>
      </div>
    </div>
  );
}
