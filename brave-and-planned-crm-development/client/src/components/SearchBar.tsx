import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  placeholder = "Qidirish...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        const tag = document.activeElement?.tagName;
        if (tag && ["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  return (
    <div className="relative flex items-center group w-full">
      <div className="absolute left-4 text-white/40 transition-colors group-focus-within:text-[var(--gold)] pointer-events-none">
        <Search size={18} />
      </div>
      <input
        ref={inputRef}
        type="text"
        role="searchbox"
        aria-label="Qidirish"
        className="input pl-11 pr-20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <div className="absolute right-4 flex items-center gap-2">
        {value ? (
          <button
            type="button"
            aria-label="Tozalash"
            title="Tozalash"
            onClick={() => { onChange(""); inputRef.current?.focus(); }}
            className="text-white/40 hover:text-white/70 transition-colors p-1"
          >
            <X size={16} />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/5 px-1.5 font-sans text-[10px] font-medium text-white/45 pointer-events-none">
            <span className="text-xs">⌘</span>K
          </kbd>
        )}
      </div>
    </div>
  );
}
