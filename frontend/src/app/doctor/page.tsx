"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function DoctorDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "doctor") { router.push("/auth/login"); return; }
    try {
      const res = await api.get("/appointments", { headers: { Authorization: "Bearer " + token } });
      setAppointments(res.data.appointments || []);
    } catch { setError("Failed to load appointments."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleMarkDone = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setMarkingId(id); setError(null); setSuccess(null);
    try {
      await api.patch("/appointments/" + id + "/done", {}, { headers: { Authorization: "Bearer " + token } });
      toast.success("Appointment marked as done.");
      await fetchAppointments();
    } catch { toast.error("Failed to mark as done."); }
    finally { setMarkingId(null); }
  };

  const handleCancel = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setCancellingId(id); setError(null); setSuccess(null);
    try {
      await api.patch("/appointments/" + id + "/cancel", {}, { headers: { Authorization: "Bearer " + token } });
      toast.success("Appointment cancelled.");
      await fetchAppointments();
    } catch { toast.error("Failed to cancel."); }
    finally { setCancellingId(null); }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  const scheduled = appointments.filter((a: any) => a.status === "scheduled");
  const done = appointments.filter((a: any) => a.status === "completed");
  const cancelled = appointments.filter((a: any) => a.status === "canceled");

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-1 text-2xl font-semibold">Doctor Dashboard</h1>
        <p className="mb-6 text-sm text-slate-400">Manage your patient appointments.</p>
        <div className="mb-6 grid grid-cols-3 gap-4 text-center">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-2xl font-bold text-teal-400">{scheduled.length}</p>
            <p className="text-xs text-slate-400">Scheduled</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-2xl font-bold text-green-400">{done.length}</p>
            <p className="text-xs text-slate-400">Completed</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-2xl font-bold text-red-400">{cancelled.length}</p>
            <p className="text-xs text-slate-400">Cancelled</p>
          </div>
        </div>
        {success && <div className="mb-4 rounded-lg bg-teal-500/10 px-4 py-3 text-sm text-teal-300">{success}</div>}
        {error && <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
        {loading ? <p className="text-slate-400">Loading...</p> : appointments.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 text-center text-sm text-slate-400">No appointments yet.</div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt: any) => (
              <motion.div key={appt.appointment_id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-100">{appt.patient_first_name} {appt.patient_last_name}</p>
                    <p className="text-xs text-slate-400">{formatDate(appt.appointment_time)}</p>
                  </div>
                  <span className={"rounded-full px-3 py-1 text-xs font-medium " + (appt.status === "scheduled" ? "bg-teal-500/10 text-teal-300" : appt.status === "completed" ? "bg-green-500/10 text-green-300" : "bg-red-500/10 text-red-400")}>
                    {appt.status}
                  </span>
                </div>
                {appt.status === "scheduled" && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => handleMarkDone(appt.appointment_id)} disabled={markingId === appt.appointment_id} className="rounded-lg bg-teal-500 px-4 py-1.5 text-xs font-medium text-slate-950 hover:bg-teal-400 disabled:opacity-50">
                      {markingId === appt.appointment_id ? "Marking..." : "Mark as done"}
                    </button>
                    <button onClick={() => handleCancel(appt.appointment_id)} disabled={cancellingId === appt.appointment_id} className="rounded-lg border border-red-500/40 px-4 py-1.5 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50">
                      {cancellingId === appt.appointment_id ? "Cancelling..." : "Cancel"}
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

