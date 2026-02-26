"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    setEmail(localStorage.getItem("email") || "");
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out.");
    router.push("/auth/login");
  };

  const initial = email ? email[0].toUpperCase() : "?";

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800/50 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🏥</span>
          <span className="text-sm font-bold text-teal-400">MediHive</span>
        </Link>

        <div className="flex items-center gap-3 text-xs">
          {!role && (
            <>
              <Link href="/doctors" className="text-slate-300 hover:text-teal-300 transition">Doctors</Link>
              <Link href="/auth/login" className="rounded-full bg-gradient-to-r from-teal-500 to-teal-400 px-4 py-1.5 font-medium text-slate-950 hover:from-teal-400 hover:to-teal-300 transition">Login</Link>
              <Link href="/auth/register" className="rounded-full border border-slate-700 px-4 py-1.5 text-slate-300 hover:bg-slate-800 transition">Register</Link>
            </>
          )}
          {role === "patient" && (
            <>
            <Link href="/doctors" className="text-slate-300 hover:text-teal-300 transition">Find a Doctor</Link>
              <Link href="/appointments" className="text-slate-300 hover:text-teal-300 transition">Appointments</Link>
            </>
          )}
          {role === "doctor" && (
            <Link href="/doctor" className="text-slate-300 hover:text-teal-300 transition">Dashboard</Link>
          )}
          {role === "admin" && (
            <Link href="/admin" className="text-slate-300 hover:text-teal-300 transition">Admin Panel</Link>
          )}
          {role && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 pl-1 pr-3 py-1 hover:bg-slate-700 transition"
              >
                <div className={"flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold " + (role === "doctor" ? "bg-blue-500/20 text-blue-300" : role === "admin" ? "bg-purple-500/20 text-purple-300" : "bg-teal-500/20 text-teal-300")}>
                  {initial}
                </div>
                <span className="max-w-24 truncate text-slate-300">{email.split("@")[0]}</span>
                <span className="text-slate-500">▾</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 w-48 rounded-2xl border border-slate-700 bg-slate-900 p-1 shadow-2xl">
                  <div className="border-b border-slate-800 px-3 py-2">
                    <p className="truncate text-xs font-medium text-slate-200">{email}</p>
                    <span className={"mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs " + (role === "doctor" ? "bg-blue-500/10 text-blue-300" : role === "admin" ? "bg-purple-500/10 text-purple-300" : "bg-teal-500/10 text-teal-300")}>
                      {role}
                    </span>
                  </div>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 transition">
                    <span>👤</span> Profile
                  </Link>
                  {role === "patient" && (
                    <Link href="/appointments" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 transition">
                      <span>📅</span> Appointments
                    </Link>
                  )}
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition">
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
    )}
        </div>
      </div>
    </nav>
  );
}

