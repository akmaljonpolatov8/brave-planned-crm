import { useState } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      toast.success("Kirish muvaffaqiyatli");
      navigate("/");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Kirishda xatolik";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card bp-fadeup">
        <div className="auth-brand">
          <div className="brand-mark">BP</div>
          <h1>Brave and Planet</h1>
          <div className="auth-subtitle">Ta'lim Markazi CRM</div>
        </div>
        <form className="form-grid" onSubmit={submit} style={{ marginTop: 28 }}>
          <label className="form-label">
            Username
            <input
              className="bp-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="owner"
            />
          </label>
          <label className="form-label">
            Parol
            <div className="form-two" style={{ gridTemplateColumns: "1fr auto" }}>
              <input
                className="bp-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? "Yashirish" : "Ko'rish"}
              </Button>
            </div>
          </label>
          {error ? <div className="error-text">{error}</div> : null}
          <Button type="submit" disabled={loading}>
            {loading ? "Kirilmoqda..." : "Kirish"}
          </Button>
        </form>
        <div className="auth-footer">© 2026 Brave and Planet</div>
      </div>
    </div>
  );
}
