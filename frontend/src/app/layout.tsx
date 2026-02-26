import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

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
        <Navbar />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e293b",
              color: "#f8fafc",
              border: "1px solid #334155",
              fontSize: "13px",
            },
            success: { iconTheme: { primary: "#14b8a6", secondary: "#f8fafc" } },
            error: { iconTheme: { primary: "#f87171", secondary: "#f8fafc" } },
          }}
        />
        {children}
      </body>
    </html>
  );
}

