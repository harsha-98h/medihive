import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MediHive",
  description: "Medical appointment booking"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-50`}>
        <header className="border-b border-slate-800 bg-slate-950/80">
        <div className="flex items-center gap-4">
  <a href="/doctors" className="text-sm text-slate-300 hover:text-teal-300">
    Doctors
  </a>
  <a href="/appointments" className="text-sm text-slate-300 hover:text-teal-300">
    Appointments
  </a>
  <a
    href="/auth/login"
    className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-teal-400 hover:text-teal-300"
  >
    Sign in
  </a>
</div>

          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
