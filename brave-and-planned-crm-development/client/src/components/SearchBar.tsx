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
      // Don't focus if user is already in an input/textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isMac =
    typeof window !== "undefined" &&
    /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <Search size={18} className="text-white/30" />
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
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-2">
        {value && (
          <button
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            className="p-1 hover:bg-white/10 rounded-md text-white/50 hover:text-white transition-colors"
            title="Tozalash"
            aria-label="Qidiruvni tozalash"
          >
            <X size={16} />
          </button>
        )}
        <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-white/40 opacity-100">
          <span className="text-xs">{isMac ? "⌘" : "Ctrl+"}</span>K
        </kbd>
      </div>
    </div>
  );
}
