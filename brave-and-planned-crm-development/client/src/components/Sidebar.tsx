import { NavLink } from "react-router-dom";

const items = [
  ["/", "📊 Dashboard"],
  ["/groups", "🏫 Guruhlar"],
  ["/students", "👩‍🎓 O'quvchilar"],
  ["/teachers", "👩‍🏫 O'qituvchilar"],
  ["/attendance", "✅ Davomat"],
  ["/payments", "💳 To'lovlar"],
  ["/debtors", "⚠️ Qarzdorlar"],
  ["/sms", "✉️ SMS"],
  ["/reports", "📈 Hisobotlar"],
  ["/import", "📥 Import"],
] as const;

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/10 bg-[#031B1B] p-6 lg:block">
      <div className="font-display text-3xl text-[#46CFB0]">
        Brave and Planet
      </div>
      <p className="mt-2 text-sm text-white/60">Education center CRM</p>
      <nav className="mt-8 space-y-2">
        {items.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block rounded-2xl px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-[#46CFB0] text-[#031B1B]"
                  : "text-white/70 hover:bg-white/5"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
