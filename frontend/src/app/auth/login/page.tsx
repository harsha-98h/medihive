"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("user_id", String(user.user_id));
      localStorage.setItem("email", user.email);
      toast.success("Welcome back!");
      if (user.role === "doctor") router.push("/doctor");
      else if (user.role === "admin") router.push("/admin");
      else router.push("/");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-3xl">
            🏥
          </div>
          <h1 className="text-2xl font-bold text-slate-50">Welcome to MediHi</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to your account</p>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-700/50 bg-slate-800/40 p-2 backdrop-blur">
          <div className="grid grid-cols-3 gap-1 text-center text-xs">
            <div className="rounded-xl bg-teal-500/10 px-3 py-2 text-teal-300">
              <div className="text-lg">👤</div>
              <div className="font-medium">Patient</div>
              <div className="text-slate-400">Book doctors</div>
            </div>
            <div className="rounded-xl bg-blue-500/10 px-3 py-2 text-blue-300">
              <div className="text-lg">🩺</div>
              <div class="font-medium">Doctor</div>
              <div className="text-slate-400">Manage visits</div>
            </div>
            <div className="rounded-xl bg-purple-500/10 px-3 py-2 text-purple-300">
              <div className="text-lg">⚙️</div>
              <div className="font-medium">Admin</div>
              <div className="text-slate-400">Full access</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/80 p-6 shadow-2xl backdrop-blur">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Email address</label>
              <input
                type="email"
                requi                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl boe-700 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-500/20 hover:from-teal-400 hover:to-teal-300 disabled:opacity-50 transition"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-slate-400">
            Do not have an account?{" "}
            <Link href="/auth/register" className="font-medium text-teal-400 hover:text-teal-300">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

