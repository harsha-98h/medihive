"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/auth/login"); return; }
    const headers = { Authorization: "Bearer " + token };
    Promise.all([
      api.get("/users/me", { headers }),
      api.get("/appointments", { headers }),
    ])
      .then(([u, a]) => {
        setUser(u.data.user);
        setFirstName(u.data.user.first_name || "");
        setLastName(u.data.user.last_name || "");
        setPhone(u.data.user.phone_number || "");
        setAppointments(a.data.appointments || []);
      })
      .catch(() => toast.error("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setSaving(true);
    try {
      await api.put("/users/me", { first_name: firstName, last_name: lastName, phone_number: phone }, { headers: { Authorization: "Bearer " + token } });
      setUser((prev: any) => ({ ...prev, first_name: firstName, last_name: lastName, phone_number: phone }));
      setEditing(false);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out.");
    router.push("/auth/login");
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  const scheduled = appointments.filter((a) => a.status === "scheduled").length;
  const done = appointments.filter((a) => a.status === "done").length;
  const cancelled = appointments.filter((a) => a.status === "canceled").length;

  if (loading) return <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50"><p className="text-slate-400">Loading...</p></main>;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 text-2xl font-semibold">My Profile</h1>
        <p className="mb-6 text-sm text-slate-400">Your account details and appointment summary.</p>

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-start justify-between">
            <div>
              {user?.first_name && (
                <p className="text-lg font-semibold text-slate-100">{user.first_name} {user.last_name}</p>
              )}
              <p className="text-sm text-slate-400">{user?.email}</p>
              {user?.specialty && <p className="mt-0.5 text-xs text-teal-300">{user.specialty}</p>}
              {user?.phone_number && <p className="mt-0.5 text-xs text-slate-400">📞 {user.phone_number}</p>}
              {user?.address && <p className="mt-0.5 text-xs text-slate-400">📍 {user.address}</p>}
              <span className={"mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-medium " + (user?.role === "doctor" ? "bg-blue-500/10 text-blue-300" : user?.role === "admin" ? "bg-purple-500/10 text-purple-300" : "bg-teal-500/10 text-teal-300")}>
                {user?.role}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(!editing)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800">
                {editing ? "Ca" : "Edit"}
              </button>
              <button onClick={handleLogout} className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10">
                Logout
              </button>
            </div>
          </div>

          {editing && (
            <div className="mt-4 space-y-3 border-t border-slate-800 pt-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  abel className="mb-1 block text-xs text-slate-400">First name</label>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-teal-500" />
                </div>
                <div className="flex-1">
                  abel className="mb-1 block text-xs text-slate-400">Last name</label>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-teal-500" />
                </div>
              </div>
              <div>
                abel className="mb-1 block text-xs text-slate-400">Phone number</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-teal-500" />
              </div>
              <button onClick={handleSave} disabled={saving} className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-teal-400 disabled:opacity-50">
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          )}
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
        {appointments.length === 0 ? (
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

