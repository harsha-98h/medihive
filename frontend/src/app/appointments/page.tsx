"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

type Appointment = {
  appointment_id: number;
  doctor_id: number;
  appointment_time: string;
  status: string;
  notes: string | null;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/appointments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data.appointments || []);
    } catch {
      setError("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setCancellingId(id);
    try {
      await api.patch(
        `/appointments/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAppointments();
    } catch {
      setError("Failed to cancel appointment.");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-2xl font-semibold">My Appointments</h1>
        <p className="mb-6 text-sm text-slate-400">
          View and manage your booked appointments.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-400">Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 text-center text-sm text-slate-400">
            No appointments yet.{" "}
            <a href="/doctors" className="text-teal-400 underline">
              Book one now
            </a>
            .
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => (
              <motion.div
                key={appt.appointment_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-100">
                      Appointment #{appt.appointment_id}
                    </p>
                    <p className="text-xs text-slate-400">
                      Doctor ID: {appt.doctor_id}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      appt.status === "scheduled"
                        ? "bg-teal-500/10 text-teal-300"
                        : appt.status === "cancelled"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-sm text-slate-400">
                  <p>Date: {formatDate(appt.appointment_time)}</p>
                  {appt.notes && <p>Notes: {appt.notes}</p>}
                </div>

                {appt.status === "scheduled" && (
                  <button
                    onClick={() => handleCancel(appt.appointment_id)}
                    disabled={cancellingId === appt.appointment_id}
                    className="mt-4 rounded-lg border border-red-500/40 px-4 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
                  >
                    {cancellingId === appt.appointment_id
                      ? "Cancelling..."
                      : "Cancel appointment"}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

