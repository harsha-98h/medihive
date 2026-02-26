"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        email,
        password,
        role,
        first_name: firstName,
        last_name: lastName,
      });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("user_id", String(user.user_id));
      localStorage.setItem("email", user.email);

      if (user.role === "doctor") {
        router.push("/doctor");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <h1 className="mb-1 text-xl font-semibold text-slate-50">
          Create an account
        </h1>
        <p className="mb-6 text-xs text-slate-400">
          Register as a patient or doctor.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-slate-400">
                First name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-teal-500"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-slate-400">
                Last name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-teal-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              I am a
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole("patient")}
                className={`flex-1 rounded-lg border py-2 text-xs font-medium transition ${
                  role === "patient"
                    ? "border-teal-500 bg-teal-500/20 text-teal-300"
                    : "border-slate-700 text-slate-400 hover:border-teal-600"
                }`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => setRole("doctor")}
                className={`flex-1 rounded-lg border py-2 text-xs font-medium transition ${
                  role === "doctor"
                    ? "border-teal-500 bg-teal-500/20 text-teal-300"
                    : "border-slate-700 text-slate-400 hover:border-teal-600"
                }`}
              >
                Doctor
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-teal-500 py-2 text-sm font-medium text-slate-950 hover:bg-teal-400 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-teal-400 underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
