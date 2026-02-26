"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
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

  const [ratingApptId, setRatingApptId] = useState<number | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState<string>("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/appointments", {
        headers: { Authorization: `Bearer ${token}` },
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
      toast.error("Failed to cancel appointment.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleSubmitRating = async (appt: Appointment) => {
    if (!ratingValue) {
      setError("Please select a rating.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in.");
      return;
    }
    setRatingSubmitting(true);
    try {
      await api.post(
        `/doctors/${appt.doctor_id}/ratings`,
        {
          appointment_id: appt.appointment_id,
          rating: ratingValue,
          comment: ratingComment || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRatingApptId(null);
      setRatingValue(0);
      setRatingComment("");
      await fetchAppointments();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to submit rating."
      );
    } finally {
      setRatingSubmitting(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
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
            {appointments.map((appt: any) => (
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

                {appt.status === "done" && (
                  <div className="mt-4 border-t border-slate-800 pt-3">
                    {ratingApptId !== appt.appointment_id ? (
                      <button
                        onClick={() => {
                          setRatingApptId(appt.appointment_id);
                          setRatingValue(0);
                          setRatingComment("");
                        }}
                        className="rounded-lg border border-teal-500/40 px-4 py-1.5 text-xs text-teal-300 transition hover:bg-teal-500/10"
                      >
                        Rate this doctor
                      </button>
                    ) : (
                      <div className="space-y-2 text-xs text-slate-300">
                        <p className="text-[11px] text-slate-400">
                          Rate your experience with this doctor (1–5).
                        </p>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingValue(star)}
                              className={`h-7 w-7 rounded-full border text-sm ${
                                ratingValue >= star
                                  ? "border-yellow-400 bg-yellow-400/20 text-yellow-300"
                                  : "border-slate-700 bg-slate-800 text-slate-400"
                              }`}
                            >
                              {star}
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={ratingComment}
                          onChange={(e) =>
                            setRatingComment(e.target.value)
                          }
                          placeholder="Optional feedback"
                          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/80 p-2 text-xs outline-none focus:border-teal-400"
                          rows={2}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSubmitRating(appt)}
                            disabled={ratingSubmitting}
                            className="rounded-lg bg-teal-500/90 px-4 py-1.5 text-xs font-medium text-slate-950 transition hover:bg-teal-400 disabled:opacity-60"
                          >
                            {ratingSubmitting
                              ? "Submitting..."
                              : "Submit rating"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRatingApptId(null);
                              setRatingValue(0);
                              setRatingComment("");
                            }}
                            className="text-[11px] text-slate-400 hover:text-slate-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
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
