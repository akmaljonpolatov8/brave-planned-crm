import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  placeholder = "Qidirish",
  ariaLabel = "Qidirish",
  clearTitle = "Tozalash",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  clearTitle?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "k" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

  return (
    <div className="relative flex items-center w-full group">
      <div className="absolute left-3 flex items-center pointer-events-none text-white/40 group-focus-within:text-yellow-400">
        <Search size={18} />
      </div>
      <input
        ref={ref}
        type="text"
        role="searchbox"
        aria-label={ariaLabel}
        className="input pl-10 pr-24 w-full focus:ring-yellow-400 focus:border-yellow-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <div className="absolute right-3 flex items-center gap-2">
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            title={clearTitle}
            aria-label={clearTitle}
            className="text-white/40 hover:text-white/80 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        )}
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-white/40">
          {isMac ? "⌘K" : "Ctrl+K"}
        </kbd>
      </div>
    </div>
  );
}
