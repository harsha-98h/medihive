"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      router.push("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <h1 className="mb-2 text-2xl font-semibold text-slate-50">
          Sign in to MediHive
        </h1>
        <p className="mb-6 text-sm text-slate-400">
          Enter your email and password to continue.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-200">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-teal-500"
            />
          </div>

          <p className="mt-1 text-right text-xs">
            <a href="/auth/forgot" className="text-teal-400 underline">
              Forgot password?
            </a>
          </p>

          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-teal-500 py-2 text-sm font-medium text-slate-950 transition hover:bg-teal-400 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <p className="text-center text-xs text-slate-400">
            No account?{" "}
            <a href="/auth/register" className="text-teal-400 underline">
              Register here
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
