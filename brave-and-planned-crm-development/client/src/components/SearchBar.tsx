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
        if (
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA"
        ) {
          return;
        }
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative group w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search
          className="h-5 w-5 text-white/30 group-focus-within:text-[var(--gold)] transition-colors"
          aria-hidden="true"
        />
      </div>
      <input
        ref={inputRef}
        type="text"
        role="searchbox"
        aria-label="Qidirish"
        className="input !pl-10 !pr-10"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-2">
        {value && (
          <button
            onClick={() => onChange("")}
            className="p-1 rounded-md hover:bg-white/10 text-white/30 hover:text-white transition-colors"
            aria-label="Tozalash"
          >
            <X size={16} />
          </button>
        )}
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-sans text-[10px] font-medium text-white/40 group-focus-within:border-[var(--gold)]/30 group-focus-within:text-[var(--gold)]/60">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
    </div>
  );
}
