"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/auth/login"); return; }
    setEmail(localStorage.getItem("email") || "");
    setRole(localStorage.getItem("role") || "");
    setUserId(localStorage.getItem("user_id") || "");
    api.get("/appointments", { headers: { Authorization: "Bearer " + token } })
      .then((res) => setAppointments(res.data.appointments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso) => new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  const handleLogout = () => { localStorage.clear(); router.push("/auth/login"); };
  const scheduled = appointments.filter((a) => a.status === "scheduled").length;
  const done = appointments.filter((a) => a.status === "done").length;
  const cancelled = appointments.filter((a) => a.status === "canceled").length;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 text-2xl font-semibold">My Profile</h1>
        <p className="mb-6 text-sm text-slate-400">Your account details and appointment summary.</p>
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-100">{email}</p>
              <p className="mt-0.5 text-xs text-slate-400">User ID: {userId}</p>
              <span className={"mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-medium " + (role === "doctor" ? "bg-blue-500/10 text-blue-300" : role === "admin" ? "bg-purple-500/10 text-purple-300" : "bg-teal-500/10 text-teal-300")}>
                {role}
              </span>
            </div>
            <button onClick={handleLogout} className="rounded-lg border border-red-500/40 px-4 py-1.5 text-xs text-red-400 hover:bg-red-500/10">
              Log out
            </button>
          </div>
        </div>
        <div className="mb-6 grid grid-cols-3 gap-4 text-center">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-2xl font-bold text-teal-400">{scheduled}</p>
            <p className="text-xs text-slate-400">Upcoming</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-2xl font-bold text-green-400">{done}</p>
            <p className="text-xs text-slate-400">Completed</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-2xl font-bold text-red-400">{cancelled}</p>
            <p className="text-xs text-slate-400">Cancelled</p>
          </div>
        </div>
        <h2 className="mb-3 text-sm font-semibold text-slate-100">Appointment History</h2>
        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : appointments.length === 0 ? (
          <p className="text-slate-400 text-sm">No appointments yet.</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => (
              <div key={a.appointment_id} className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-100">
                    {a.doctor_first_name ? "Dr. " + a.doctor_first_name + " " + a.doctor_last_name : a.patient_first_name + " " + a.patient_last_name}
                  </p>
                  <span className={"rounded-full px-2 py-0.5 text-xs " + (a.status === "scheduled" ? "bg-teal-500/10 text-teal-300" : a.status === "done" ? "bg-green-500/10 text-green-300" : "bg-red-500/10 text-red-400")}>
                    {a.status}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">{formatDate(a.appointment_time)}</p>
                {a.specialty && <p className="text-xs text-teal-300">{a.specialty}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

