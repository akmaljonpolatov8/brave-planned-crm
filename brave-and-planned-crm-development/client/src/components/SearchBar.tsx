import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

export function SearchBar({ value, onChange, placeholder = "Qidirish" }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        const act = document.activeElement?.tagName;
        if (act === "INPUT" || act === "TEXTAREA" || document.activeElement?.getAttribute("contenteditable") === "true") return;
        e.preventDefault(); inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  const isMac = typeof window !== "undefined" && /Mac|iPod|iPhone/i.test(navigator.userAgent);
  return (
    <div className="relative flex items-center group w-full">
      <Search size={18} className="absolute left-4 text-white/40 transition-colors group-focus-within:text-[var(--gold)]" />
      <input ref={inputRef} type="text" role="searchbox" aria-label="Qidirish" className="input pl-11 pr-20 w-full" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      <div className="absolute right-4 flex items-center gap-2">
        {value && (
          <button onClick={() => { onChange(""); inputRef.current?.focus(); }} type="button" aria-label="Tozalash" title="Tozalash" className="text-white/40 hover:text-white transition-colors p-1">
            <X size={16} />
          </button>
        )}
        <kbd className="hidden sm:inline-flex select-none items-center gap-0.5 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-white/40">
          <span>{isMac ? "⌘" : "Ctrl+"}</span>K
        </kbd>
      </div>
    </div>
  );
}
