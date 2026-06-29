import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

export function SearchBar({ value, onChange, placeholder = "Qidirish" }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.platform);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")) {
        e.preventDefault(); inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="group relative w-full">
      <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[var(--gold)]" />
      <input ref={inputRef} type="text" role="searchbox" aria-label={placeholder} className="input pl-11 pr-24" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
        {value && <button type="button" onClick={() => { onChange(""); inputRef.current?.focus(); }} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white" aria-label="Tozalash"><X size={16} /></button>}
        <kbd className="hidden h-6 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] text-white/30 group-focus-within:opacity-0 sm:flex">
          <span className="text-[12px]">{isMac ? "⌘" : "Ctrl"}</span>K
        </kbd>
      </div>
    </div>
  );
}
