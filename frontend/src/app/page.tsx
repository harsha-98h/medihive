"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type User = {
  user_id: string;
  email: string;
  role: "patient" | "doctor" | "admin";
};

type PatientAppointment = {
  appointment_id: number;
  appointment_time: string;
  status: string;
  doctor_first_name: string;
  doctor_last_name: string;
  specialty: string;
};

type DoctorAppointment = {
  appointment_id: number;
  appointment_time: string;
  status: string;
  patient_first_name: string;
  patient_last_name: string;
};

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { setUser(null); }
    }
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/appointments", { headers: { Authorization: "Bearer " + token } })
        .then((res) => setAppointments(res.data.appointments || []))
        .catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth/login";
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  const upcoming = appointments.filter((a) => a.status === "scheduled");
  const past = appointments.filter((a) => a.status !== "scheduled");

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-2xl font-semibold">
          {user?.role === "doctor" ? "Doctor Dashboard" : "MediHive Dashboard"}
        </h1>
        <p className="mb-6 text-sm text-slate-400">
          {user?.role === "doctor"
            ? "Manage your upcoming patient appointments."
            : "Welcome back. Here is your health summary."}
        </p>

        {user ? (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div>
              <p className="text-sm text-slate-300">Signed in as</p>
              <p className="text-lg font-medium">{user.email}</p>
              <p className="text-xs text-slate-400">Role: {user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-red-400 hover:text-red-300"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
            You are not signed in.{" "}
            <a href="/auth/login" className="text-teal-400 underline">Go to login</a>.
          </div>
        )}

        {user?.role === "doctor" ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <h2 className="mb-4 text-sm font-semibold text-slate-100">
                Upcoming Patient Appointments ({upcoming.length})
              </h2>
              {upcoming.length === 0 ? (
                <p className="text-xs text-slate-400">No upcoming appointments.</p>
              ) : (
                <ul className="space-y-3">
                  {upcoming.map((a: DoctorAppointment) => (
                    <li className="rounded-lg bg-slate-800/60 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-100">
                            {a.patient_first_name} {a.patient_last_name}
                          </p>
                          <p className="text-xs text-teal-300">{formatDate(a.appointment_time)}</p>
                        </div>
                        <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs text-teal-300">
                          scheduled
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {past.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <h2 className="mb-4 text-sm font-semibold text-slate-100">
                  Past Appointments ({past.length})
                </h2>
                <ul className="space-y-3">
                  {past.map((a: DoctorAppointment) => (
                    <li className="rounded-lg bg-slate-800/60 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-100">
                            {a.patient_first_name} {a.patient_last_name}
                          </p>
                          <p className="text-xs text-slate-400">{formatDate(a.appointment_time)}</p>
                        </div>
                        <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-300">
                          {a.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <h2 className="mb-3 text-sm font-semibold text-slate-100">Upcoming Appointments</h2>
              {upcoming.length === 0 ? (
                <p className="text-xs text-slate-400">
                  No upcoming appointments.{" "}
                  <a href="/doctors" className="text-teal-400 underline">Book one</a>.
                </p>
              ) : (
                <ul className="space-y-2">
                  {upcoming.slice(0, 3).map((a: PatientAppointment) => (
                    <li className="rounded-lg bg-slate-800/60 px-3 py-2 text-xs">
                      <p className="font-medium text-slate-100">Dr. {a.doctor_first_name} {a.doctor_last_name}</p>
                      <p className="text-slate-400">{a.specialty}</p>
                      <p className="text-teal-300">{formatDate(a.appointment_time)}</p>
                    </li>
                  ))}
                </ul>
              )}
              <a href="/appointments" className="mt-3 block text-xs text-teal-400 underline">
                View all appointments
              </a>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <h2 className="mb-2 text-sm font-semibold text-slate-100">Find Doctors</h2>
              <p className="text-xs text-slate-400">Browse our network of verified doctors.</p>
              <a href="/doctors" className="mt-3 block text-xs text-teal-400 underline">Browse doctors</a>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <h2 className="mb-2 text-sm font-semibold text-slate-100">Medical History</h2>
              <p className="text-xs text-slate-400">Past visits and prescriptions will show up here.</p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
// doctor dashboard update
