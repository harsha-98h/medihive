"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Appointment = {
  appointment_id: number;
  doctor_first_name: string;
  doctor_last_name: string;
  specialty: string;
  appointment_time: string;
  status: string;
};

export default function HomePage() {
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const r = localStorage.getItem("role");
    setRole(r);
    if (!token || r !== "patient") return;
    api.get("/appointments", { headers: { Authorization: "Bearer " + token } })
      .then((res) => {
        const appts = (res.data.appointments || []).filter((a: Appointment) => a.status === "scheduled");
        setUpcoming(appts.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-slate-50">
            Your health, <span className="text-teal-400">simplified</span>
          </h1>
          <p className="mb-8 text-lg text-slate-400">
            Book doctor appointments instantly. View your history. Stay on top of your health.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/doctors" className="rounded-full bg-teal-500 px-6 py-2.5 text-sm font-medium text-slate-950 hover:bg-teal-400">
              Find a doctor
            </Link>
            {!role && (
              <Link href="/auth/register" className="rounded-full border border-slate-700 px-6 py-2.5 text-sm text-slate-200 hover:bg-slate-800">
                Create account
              </Link>
            )}
            {role === "patient" && (
              <Link href="/appointments" className="rounded-full border border-slate-700 px-6 py-2.5 text-sm text-slate-200 hover:bg-slate-800">
                My appointments
              </Link>
            )}
            {role === "doctor" && (
              <Link href="/doctor" className="rounded-full border border-slate-700 px-6 py-2.5 text-sm text-slate-200 hover:bg-slate-800">
                Go to dashboard
              </Link>
            )}
            {role === "admin" && (
              <Link href="/admin" className="rounded-full border border-slate-700 px-6 py-2.5 text-sm text-slate-200 hover:bg-slate-800">
                Admin panel
              </Link>
            )}
          </div>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="mb-3 text-2xl">🩺</div>
            <h3 className="mb-2 text-sm font-semibold text-slate-100">Find specialists</h3>
            <p className="text-xs text-slate-400">Browse verified doctors by specialty and city. See ratings, hospital info, and contact details before booking.</p>
          </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="mb-3 text-2xl">📅</div>
            <h3 className="mb-2 text-sm font-semibold text-slate-100">Book instantly</h3>
            <p className="text-xs text-slate-400">Pick a date and time that works for you. Get a confirmation email right away.</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="mb-3 text-2xl">⭐</div>
            <h3 className="mb-2 text-sm font-semibold text-slate-100">Rate your experience</h3>
            <p className="text-xs text-slate-400">After your visit, leave a rating and help others find the best doctors.</p>
          </div>
        </div>

        {role === "patient" && upcoming.length > 0 && (
          <div className="rounded-2xl bo border-slate-800 bg-slate-900/70 p-6">
            <h2 className="mb-4 text-sm font-semibold text-slate-100">Your upcoming appointments</h2>
            <div className="space-y-3">
              {upcoming.map((a) => (
                <div key={a.appointment_id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/60 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-100">Dr. {a.doctor_first_name} {a.doctor_last_name}</p>
                    <p className="text-xs text-slate-400">{a.specialty} · {formatDate(a.appointment_time)}</p>
                  </div>
                  <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs text-teal-300">scheduled</span>
                </div>
              ))}
            </div>
           <Link href="/appointments" className="mt-4 inline-block text-xs text-teal-400 underline hover:text-teal-300">
              View all appointments
            </Link>
          </div>
        )}

        {!role && (
          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-6 text-center">
            <h2 className="mb-2 text-sm font-semibold text-slate-100">Get started today</h2>
            <p className="mb-4 text-xs text-slate-400">Create a free account to book appointments, track your visits, and rate doctors.</p>
            <div className="flex justify-center gap-3">
              <Link href="/auth/register" className="rounded-full bg-teal-500 px-5 py-2 text-xs font-medium text-slate-950 hover:bg-teal-400">Register</Link>
              <Link href="/auth/login" className="rounded-full border border-slate-700 px-5 py-2 text-xs text-slate-300 hover:bg-slate-800">Sign in</Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

