"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Login xatosi: " + result.error);
      } else if (result?.ok) {
        toast.success("Muvaffaqiyatli kirildi");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Biron bir xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#FFD662]">Brave & Planned</h1>
          <p className="mt-2 text-gray-400">English Learning Center CRM</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-6 rounded-lg border border-[rgba(255,214,98,0.15)] bg-[rgba(255,255,255,0.06)] p-8"
        >
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input mt-2"
              placeholder="admin"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Parol
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input mt-2"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? "Kutilmoqda..." : "Kirish"}
          </button>

          <div className="text-center text-sm text-gray-400">
            <p>Demo: admin / admin123</p>
          </div>
        </form>
      </div>
    </div>
  );
}
