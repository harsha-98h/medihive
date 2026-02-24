"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just pretend we sent an email
    setSent(true);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <h1 className="mb-2 text-2xl font-semibold text-slate-50">
          Reset your password
        </h1>
        <p className="mb-6 text-sm text-slate-400">
          Enter the email you used for MediHive. We&apos;ll send you a reset link.
        </p>

        {sent ? (
          <p className="text-sm text-emerald-400">
            If an account exists for <span className="font-medium">{email}</span>, 
            a reset link has been sent.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-200">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-teal-500"
              />
            </div>
            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-teal-500 py-2 text-sm font-medium text-slate-950 transition hover:bg-teal-400"
            >
              Send reset link
            </button>
            <p className="text-center text-xs text-slate-400">
              Remembered your password?{" "}
              <a href="/auth/login" className="text-teal-400 underline">
                Back to login
              </a>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
