"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function AdminPanel() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "admin") { router.push("/auth/login"); return; }
    const headers = { Authorization: "Bearer " + token };
    Promise.all([
      api.get("/admin/stats", { headers }),
      api.get("/admin/users", { headers }),
      api.get("/admin/appointments", { headers }),
    ])
      .then(([s, u, a]) => {
        setStats(s.data);
        setUsers(u.data.users || []);
        setAppointments(a.data.appointments || []);
      })
      .catch(() => setError("Failed to load admin data."))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso) => new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-1 text-2xl font-semibold">Admin Panel</h1>
        <p className="mb-6 text-sm text-slate-400">Manage users, doctors, and appointments.</p>

        {error && <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}

        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : (
          <>
            {stats && (
              <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-center">
                  <p className="text-2xl font-bold text-teal-400">{stats.total_users}</p>
                  <p className="text-xs text-slate-400">Total Users</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-center">
                  <p className="text-2xl font-bold text-blue-400">{stats.total_doctors}</p>
                  <p className="text-xs text-slate-400">Doctors</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-center">
                  <p className="text-2xl font-bold text-purple-400">{stats.total_appointments}</p>
                  <p className="text-xs text-slate-400">Appointments</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-400">{stats.scheduled_appointments}</p>
                  <p className="text-xs text-slate-400">Scheduled</p>
                </div>
              </div>
            )}

            <div className="mb-4 flex gap-2 text-xs">
              {["overview", "users", "appointments"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={"rounded-full px-4 py-1.5 font-medium transition " + (tab === t ? "bg-teal-500 text-slate-950" : "border border-slate-700 text-slate-300 hover:bg-slate-800")}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {tab === "overview" && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300">
                <p>Welcome to the MediHive admin panel.</p>
                <p className="mt-2 text-slate-400">Use the tabs above to manage users and appointments.</p>
              </div>
            )}

            {tab === "users" && (
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.user_id} className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-100">{u.email}</p>
                      <p className="text-xs text-slate-400">ID: {u.user_id} · Joined: {formatDate(u.created_at)}</p>
                    </div>
                    <span className={"rounded-full px-3 py-0.5 text-xs font-medium " + (u.role === "doctor" ? "bg-blue-500/10 text-blue-300" : u.role === "admin" ? "bg-purple-500/10 text-purple-300" : "bg-teal-500/10 text-teal-300")}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {tab === "appointments" && (
              <div className="space-y-3">
                {appointments.map((a) => (
                  <div key={a.appointment_id} className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-100">
                        {a.patient_first_name} {a.patient_last_name} → Dr. {a.doctor_first_name} {a.doctor_last_name}
                      </p>
                      <span className={"rounded-full px-2 py-0.5 text-xs " + (a.status === "scheduled" ? "bg-teal-500/10 text-teal-300" : a.status === "done" ? "bg-green-500/10 text-green-300" : "bg-red-500/10 text-red-400")}>
                        {a.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">{a.specialty} · {formatDate(a.appointment_time)}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

