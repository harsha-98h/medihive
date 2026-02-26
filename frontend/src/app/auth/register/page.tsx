


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
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
      toast.success("Account created successfully!");
      if (user.role === "doctor") router.push("/doctor");
      else if (user.role === "admin") router.push("/admin");
      else router.push("/");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "patient", label: "Patient", icon: "👤", desc: "Book appointments", color: "teal" },
    { value: "doctor", label: "Doctor", icon: "🩺", desc: "Manage visits", color: "blue" },
    { value: "admin", label: "Admin", icon: "⚙️", desc: "Full access", color: "purple" },
  ];

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl-500/10 text-3xl">
            🏥
          </div>
          <h1 className="text-2xl font-bold text-slate-50">Create your account</h1>
          <p className="mt-1 text-sm text-slate-400">Join MediHive today</p>
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/80 p-6 shadow-2xl backdrop-blur">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              abel className="mb-2 block text-xs font-medium text-slate-300">I am a</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={"rounded-xl border p-2.5 text-center text-xs transition " + (
                      role === r.value
                        ? r.value === "patient" ? "border-teal-500 bg-teal-500/10 text-teal-300"
                        : r.value === "ctor" ? "border-blue-500 bg-blue-500/10 text-blue-300"
                        : "border-purple-500 bg-purple-500/10 text-purple-300"
                        : "border-slate-700 text-slate-400 hover:border-slate-600"
                    )}
                  >
                    <div className="text-lg">{r.icon}</div>
                    <div className="font-medium">{r.label}</div>
                    <div className="text-slate-500">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                abel className="mb-1.5 block text-xs font-medium text-slate-300">First name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-teal-500 transition"
                />
              </div>
              <div className="flex-1">
                abel className="mb-1.5 block text-xs font-medium text-slate-300">Last name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-teal-500 transition"
                />
              </div>
            </div>

            <div>
              abel className="mb-1.5 block text-xs font-medium text-slate-300">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-teal-500 transition"
              />
            </div>

            <div>
              abel className="mb-1.5 block text-xs font-medium text-slate-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-teal-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-teal-50-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-500/20 hover:from-teal-400 hover:to-teal-300 disabled:opacity-50 transition"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-teal-400 hover:text-teal-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

