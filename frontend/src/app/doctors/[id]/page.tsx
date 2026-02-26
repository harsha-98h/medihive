"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function DoctorDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const first_name = searchParams.get("first_name") || "";
  const last_name = searchParams.get("last_name") || "";
  const specialty = searchParams.get("specialty") || "";
  const phone = searchParams.get("phone") || "";
  const address = searchParams.get("address") || "";
  const avg_rating_raw = searchParams.get("avg_rating");
  const rating_count_raw = searchParams.get("rating_count");

  const avg_rating = avg_rating_raw ? Number(avg_rating_raw) : null;
  const rating_count = rating_count_raw ? Number(rating_count_raw) : null;

  const formatRating = (avg: number | null, count: number | null) => {
    if (!avg || !count || count === 0) return "No ratings yet";
    return `${avg.toFixed(1)} / 5 (${count} ratings)`;
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.back()}
          className="mb-4 text-xs text-slate-400 hover:text-slate-200"
        >
          ← Back
        </button>

        {!first_name && !last_name ? (
          <p className="text-slate-400">Doctor details not provided in URL.</p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl"
          >
            <h1 className="text-2xl font-semibold text-slate-50">
              Dr. {first_name} {last_name}
            </h1>
            <p className="mt-1 text-sm text-teal-300">{specialty}</p>

            <div className="mt-3 flex items-center gap-2 text-sm">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={
                      avg_rating && avg_rating >= star
                        ? "text-yellow-300"
                        : "text-slate-600"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-slate-400">
                {formatRating(avg_rating, rating_count)}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-300">
              {address && (
                <p>
                  <span className="text-slate-400">Hospital: </span>
                  {address}
                </p>
              )}
              {phone && (
                <p>
                  <span className="text-slate-400">Phone: </span>
                  {phone}
                </p>
              )}
            </div>

            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
              <h2 className="mb-2 text-sm font-semibold text-slate-100">
                About this doctor
              </h2>
              <p className="text-xs text-slate-400">
                This doctor is experienced in treating patients with conditions
                related to{" "}
                <span className="text-slate-200">{specialty}</span>. They
                consult at {address || "the listed hospital"} and are available
                for appointments through MediHive.
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => router.push("/doctors")}
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
              >
                View all doctors
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
