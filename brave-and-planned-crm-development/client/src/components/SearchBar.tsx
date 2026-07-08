import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

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
        const activeElement = document.activeElement;
        const isInput = activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA";

        if (!isInput) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="group relative flex items-center">
      <div className="pointer-events-none absolute left-4 text-white/30 transition-colors group-focus-within:text-[var(--gold)]">
        <Search size={18} />
      </div>
      <input
        ref={inputRef}
        type="text"
        role="searchbox"
        aria-label="Qidirish"
        className="input pl-11 pr-24"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <div className="absolute right-4 flex items-center gap-2">
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-lg p-1 text-white/30 hover:bg-white/10 hover:text-white"
            aria-label="Tozalash"
          >
            <X size={16} />
          </button>
        )}
        <kbd className="pointer-events-none hidden rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/40 sm:block">
          ⌘K
        </kbd>
      </div>
    </div>
  );
}
