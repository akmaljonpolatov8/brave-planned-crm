import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  placeholder = "Qidirish",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="group relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/30 group-focus-within:text-[var(--gold)]">
        <Search size={18} />
      </div>
      <input
        ref={inputRef}
        type="text"
        role="searchbox"
        aria-label="Qidirish"
        className="input pl-11 pr-20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2">
        {value && (
          <button
            onClick={() => onChange("")}
            className="rounded-lg p-1 text-white/30 hover:bg-white/10 hover:text-white"
            aria-label="Tozalash"
            title="Tozalash"
          >
            <X size={16} />
          </button>
        )}
        <div className="pointer-events-none hidden items-center rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-sans text-[10px] font-medium text-white/40 sm:flex">
          <span className="text-xs">⌘</span>K
        </div>
      </div>
    </div>
  );
}
