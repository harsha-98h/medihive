"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

type Stats = {
  total_users: number;
  total_doctors: number;
  total_appointments: number;
  scheduled_appointments: number;
};

type User = {
  user_id: number;
  email: string;
  role: string;
  created_at: string;
};

type Appointment = {
  appointment_id: number;
  appointment_time: string;
  status: string;
  patient_first_name: string;
  patient_last_name: string;
  doctor_first_name: string;
  doctor_last_name: string;
  specialty: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tab, setTab] = useState<"stats" | "users" | "appointments">("stats");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) { router.push("/auth/login"); return; }
    const parsed = JSON.parse(user);
    if (parsed.role !== "admin") { router.push("/"); return; }

    const headers = { Authorization: "Bearer " + token };
    api.get("/admin/stats", { headers }).then(r => setStats(r.data)).catch(() => setError("Failed to load stats"));
    api.get("/admin/users", { headers }).then(r => setUsers(r.data.users)).catch(() => {});
    api.get("/admin/appointments", { headers }).then(r => setAppointments(r.data.appointments)).catch(() => {});
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-2xl font-semibold">Admin Panel</h1>
        <p className="mb-6 text-sm text-slate-400">Manage all users, doctors and appointments.</p>

        {error && <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}

        <div className="mb-6 flex gap-2">
          {(["stats", "users", "appointments"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={"rounded-lg px-4 py-2 text-sm font-medium capitalize transition " + (tab === t ? "bg-teal-500 text-slate-950" : "border border-slate-700 text-slate-400 hover:text-slate-200")}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "stats" && stats && (
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Total Users", value: stats.total_users },
              { label: "Total Doctors", value: stats.total_doctors },
              { label: "Total Appointments", value: stats.total_appointments },
              { label: "Scheduled", value: stats.scheduled_appointments }
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 text-center">
                <p className="text-3xl font-bold text-teal-400">{s.value}</p>
                <p className="mt-1 text-sm text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-800 bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-slate-400">ID</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400">Email</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400">Role</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-slate-400">#{u.user_id}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={"rounded-full px-2 py-0.5 text-xs " + (u.role === "doctor" ? "bg-blue-500/10 text-blue-300" : u.role === "admin" ? "bg-purple-500/10 text-purple-300" : "bg-teal-500/10 text-teal-300")}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "appointments" && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-800 bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-slate-400">ID</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400">Patient</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400">Doctor</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400">Time</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.appointment_id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-slate-400">#{a.appointment_id}</td>
                    <td className="px-4 py-3">{a.patient_first_name} {a.patient_last_name}</td>
                    <td className="px-4 py-3">Dr. {a.doctor_first_name} {a.doctor_last_name}<br/><span className="text-xs text-slate-400">{a.specialty}</span></td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(a.appointment_time)}</td>
                    <td className="px-4 py-3">
                      <span className={"rounded-full px-2 py-0.5 text-xs " + (a.status === "scheduled" ? "bg-teal-500/10 text-teal-300" : "bg-red-500/10 text-red-400")}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
