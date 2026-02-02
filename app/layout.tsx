import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lead Intake & Qualification",
  description: "Submit and manage sales leads",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 min-h-screen">{children}</body>
    </html>
  );
}