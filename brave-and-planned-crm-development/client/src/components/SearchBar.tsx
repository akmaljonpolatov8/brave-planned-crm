export function SearchBar({
  value,
  onChange,
  placeholder = "Qidirish",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      className="input"
      aria-label="Qidirish"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
}
