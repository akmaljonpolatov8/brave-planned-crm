import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      await login(username, password);
      toast.success("Kirish muvaffaqiyatli");
      navigate("/");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Kirishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#031B1B,#0A3A3A)] p-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-[rgba(70,207,176,0.2)] bg-[#031B1B] p-8 shadow-[0_20px_60px_rgba(70,207,176,0.15)]">
        <div className="text-center">
          <h1 className="font-display text-[#46CFB0]">Brave and Planet</h1>
          <p className="mt-2 text-white/70">Education Center CRM</p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={submit}>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parol"
          />
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form>
        {/* Demo credentials removed from UI for security. See README for setup. */}
      </div>
    </div>
  );
}
