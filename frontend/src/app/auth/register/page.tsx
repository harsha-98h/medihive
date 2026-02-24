"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["patient", "doctor"])
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "patient" }
  });

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/register", data);
      router.push("/auth/login");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <h1 className="mb-2 text-2xl font-semibold text-slate-50">
          Create your account
        </h1>
        <p className="mb-6 text-sm text-slate-400">
          Join MediHive to book appointments online.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-slate-200">First name</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-teal-500"
                {...register("first_name")}
              />
              {formState.errors.first_name && (
                <p className="mt-1 text-xs text-red-400">{formState.errors.first_name.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-200">Last name</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-teal-500"
                {...register("last_name")}
              />
              {formState.errors.last_name && (
                <p className="mt-1 text-xs text-red-400">{formState.errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-200">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-teal-500"
              {...register("email")}
            />
            {formState.errors.email && (
              <p className="mt-1 text-xs text-red-400">{formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-200">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-teal-500"
              {...register("password")}
            />
            {formState.errors.password && (
              <p className="mt-1 text-xs text-red-400">{formState.errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-200">I am a</label>
            <select
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-teal-500"
              {...register("role")}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-teal-500 py-2 text-sm font-medium text-slate-950 transition hover:bg-teal-400 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-xs text-slate-400">
            Already have an account?{" "}
            <a href="/auth/login" className="text-teal-400 underline">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
