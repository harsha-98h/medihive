"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

type Doctor = {
  doctor_id: number;
  first_name: string;
  last_name: string;
  specialty: string;
  phone_number: string | null;
  address: string | null;
  avg_rating?: number | null;
  rating_count?: number | null;
};

export default function DoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/doctors");
        const data = res.data.doctors || [];
        setDoctors(data);
        setFiltered(data);
      } catch {
        setError("Failed to load doctors.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    let results = doctors;
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (d) =>
          d.first_name.toLowerCase().includes(q) ||
          d.last_name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q)
      );
    }
    if (specialty) results = results.filter((d) => d.specialty === specialty);
    if (city) results = results.filter((d) => d.address?.toLowerCase().includes(city.toLowerCase()));
    setFiltered(results);
  }, [search, specialty, city, doctors]);

  const specialties = [...new Set(doctors.map((d) => d.specialty))].sort();
  const cities = [...new Set(doctors.map((d) => { if (!d.address) return null; const p = d.address.split(","); return p[p.length - 1].trim(); }).filter(Boolean))].sort();
  const today = new Date().toISOString().split("T")[0];
  const timeSlots = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","14:00","14:30","15:00","15:30","16:00","16:30"];

  const handleBookSubmit = async () => {
    if (!bookingDoctor || !selectedDate || !selectedTime) return;
    setBooking(true);
    const token = localStorage.getItem("token");
    if (!token) { setError("You must be logged in to book."); setBooking(false); return; }
    try {
      const appointmentTime = new Date(`${selectedDate}T${selectedTime}:00`);
      await api.post("/appointments", { doctor_id: bookingDoctor.doctor_id, appointment_time: appointmentTime.toISOString() }, { headers: { Authorization: "Bearer " + token } });
      setSuccess(`Appointment booked with Dr. ${bookingDoctor.first_name} ${bookingDoctor.last_name}!`);
      setBookingDoctor(null); setSelectedDate(""); setSelectedTime("");
      toast.success("Appointment booked successfully!");
      router.push("/appointments");
    } catch (err) {
      setError(err?.response?.data?.message || "Booking failed.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-2xl font-semibold">Find a Doctor</h1>
        <p className="mb-6 text-sm text-slate-400">Browse doctors and book an appointment instantly.</p>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input type="text" placeholder="Search by name or specialty..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-teal-500" />
          <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-50 outline-none focus:border-teal-500">
            <option value="">All specialties</option>
            {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-50 outline-none focus:border-teal-500">
            <option value="">All cities</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="mb-4 text-xs text-slate-400">
          Showing {filtered.length} of {doctors.length} doctors
          {city && <span className="ml-2 rounded-full bg-teal-500/10 px-2 py-0.5 text-teal-300">📍 {city}</span>}
          {specialty && <span className="ml-2 rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-300">{specialty}</span>}
        </div>

        {success && <div className="mb-4 rounded-lg bg-teal-500/10 px-4 py-3 text-sm text-teal-300">{success}</div>}
        {error && <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}

        {bookingDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-2xl border border-sle-700 bg-slate-900 p-6 shadow-2xl">
              <h2 className="mb-1 text-lg font-semibold">Book Appointment</h2>
              <p className="mb-4 text-sm text-slate-400">Dr. {bookingDoctor.first_name} {bookingDoctor.last_name} — {bookingDoctor.specialty}</p>
              {bookingDoctor.address && <p className="mb-4 text-xs text-slate-500">📍 {bookingDoctor.address}</p>}
              <div className="mb-4">
                <label className="mb-1 block text-xs text-slate-400">Select Date</label>
                <input type="date" min={today} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-50 outline-none focus:border-teal-500" />
              </div>
              <div className="mb-6">
                <label className="mb-2 block text-xs text-slate-400">Select Time Slot</label>
                <div className="flex flex-wrap gap-2">
                  {timeSlots.map((t) => (
                <button key={t} onClick={() => setSelectedTime(t)} className={"rounded-lg border px-2 py-1.5 text-xs transition " + (selectedTime === t ? "border-teal-500 bg-teal-500/20 text-teal-300" : "border-slate-700 text-slate-400 hover:border-teal-600")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setBookingDoctor(null); setSelectedDate(""); setSelectedTime(""); }} className="flex-1 rounded-lg border border-slate-700 py-2 text-sm text-slate-400 hover:text-slate-200">Cancel</button>
                <button onClick={handleBookSubmit} disabled={!selectedDate || !selectedTime || booking} className="flex-1 rounded-lg bg-teal-500 py-2 text-sm font-medium text-slate-950 hover:bg-teal-400 disabled:opacity-50">
                  {booking ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-slate-400">Loading doctors...</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 text-center text-sm text-slate-400">
            No doctors found. <button onClick={() => { setSearch(""); setSpecialty(""); setCity(""); }} className="text-teal-400 underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filtered.map((doc) => (
              <div key={doc.doctor_id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Dr. {doc.first_name} {doc.last_name}</h2>
                    <p className="text-sm text-teal-300">{doc.specialty}</p>
                    <Link href={`/doctors/${doc.doctor_id}?first_name=${encodeURIComponent(doc.first_name)}&last_name=${encodeURIComponent(doc.last_name)}&specialty=${encodeURIComponent(doc.specialty)}&phone=${encodeURIComponent(doc.phone_number || "")}&address=${encodeURIComponent(doc.address || "")}&avg_rating=${doc.avg_rating ?? ""}&rating_count=${doc.rating_count ?? ""}`} className="mt-1 inline-block text-xs text-teal-300 underline hover:text-teal-200">
                      View details
                    </Link>
                    {doc.avg_rating != null && doc.rating_count != null && doc.rating_count > 0 && (
                      <p className="mt-1 text-xs text-yellow-300">⭐ {Number(doc.avg_rating).toFixed(1)} ({doc.rating_count})</p>
                    )}
                  </div>
                  <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs text-teal-300">Available</span>
                </div>
                <div className="mt-3 space-y-1 text-sm text-slate-400">
                  {doc.phone_number && <p>📞 {doc.phone_number}</p>}
                  {doc.address && <p>📍 {doc.address}</p>}
                </div>
                <button onClick={() => { setBookingDoctor(doc); setSuccess(null); setError(null); }} className="mt-4 w-full rounded-full bg-teal-500 py-2 text-sm font-medium text-slate-950 transition hover:bg-teal-400">
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

