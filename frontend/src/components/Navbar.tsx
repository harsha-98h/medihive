"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/auth/login");
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-sm font-semibold text-teal-400">MediHive</Link>
        <div className="flex items-center gap-4 text-xs">
          {!role && (
            <>
              <Link href="/doctors" className="text-slate-300 hover:text-slate-50">Doctors</Link>
              <Link href="/auth/login" className="rounded-full bg-teal-500 px-4 py-1.5 text-slate-950 hover:bg-teal-400">Login</Link>
              <Link href="/auth/register" className="rounded-full border border-slate-700 px-4 py-1.5 text-slate-300 hover:bg-slate-800">Register</Link>
            </>
          )}
          {role === "patient" && (
            <>
              <Link href="/doctors" className="text-slate-300 hover:text-slate-50">Find a Doctor</Link>
              <Link href="/appointments" className="text-slate-300 hover:text-slate-50">Appointments</Link>
              <Link href="/profile" className="text-slate-300 hover:text-slate-50">Profile</Link>
              <button onClick={handleLogout} className="rounded-full border border-slate-700 px-4 py-1.5 text-slate-300 hover:bg-slate-800">Logout</button>
            </>
          )}
          {role === "doctor" && (
            <>
              <Link href="/doctor" className="text-slate-300 hover:text-slate-50">Dashboard</Link>
              <Link href="/profile" className="text-slate-300 hover:text-slate-50">Profile</Link>
              <button onClick={handleLogout} className="rounded-full border border-slate-700 px-4 py-1.5 text-slate-300 hover:bg-slate-800">Logout</button>
            </>
          )}
          {role === "admin" && (
            <>
              <Link href="/admin" className="text-slate-300 hover:text-slate-50">Admin Panel</Link>
              <Link href="/profile" className="text-slate-300 hover:text-slate-50">Profile</Link>
              <button onClick={handleLogout} className="rounded-full border border-slate-700 px-4 py-1.5 text-slate-300 hover:bg-slate-800">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

