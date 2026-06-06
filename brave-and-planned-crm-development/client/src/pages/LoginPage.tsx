import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, User, Lock } from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      await login(username, password);
      toast.success("Kirish muvaffaqiyatli");
      navigate("/");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Noto'g'ri username yoki parol");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a0a2e] p-4">
      <div className="w-full max-w-[420px] text-center">
        {/* Logo */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#FFD662] text-2xl font-bold text-[#422057]">
          BP
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[#FFD662]">Brave and Planet</h1>
        <p className="mt-2 text-sm text-white/60">Ta'lim Markazi CRM Tizimi</p>

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={submit}>
          <div>
            <label className="mb-1.5 block text-left text-xs font-semibold uppercase tracking-wider text-white/60">
              Foydalanuvchi nomi
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                className="w-full rounded-xl border border-[#422057] bg-[#2d1245] py-3.5 pl-12 pr-4 text-white placeholder-white/30 outline-none transition focus:border-[#FFD662] focus:ring-1 focus:ring-[#FFD662]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-left text-xs font-semibold uppercase tracking-wider text-white/60">
              Parol
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                className="w-full rounded-xl border border-[#422057] bg-[#2d1245] py-3.5 pl-12 pr-12 text-white placeholder-white/30 outline-none transition focus:border-[#FFD662] focus:ring-1 focus:ring-[#FFD662]"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            className="w-full rounded-xl bg-[#FFD662] py-3.5 text-base font-bold uppercase tracking-wide text-[#422057] transition hover:bg-[#ffdd7a] disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Kirilmoqda..." : "KIRISH"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-xs text-white/30">
          &copy; {new Date().getFullYear()} Brave and Planet Educational Center
        </p>
      </div>
    </div>
  );
}
