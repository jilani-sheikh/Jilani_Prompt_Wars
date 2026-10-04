import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "The Blind Spot — Decision Reasoning Audit Platform",
  description:
    "Examine assumptions, uncover overlooked factors, recognize reasoning conflicts, and ask better questions before making important decisions. A dedicated decision-analysis workspace.",
  keywords: [
    "decision making",
    "reasoning audit",
    "blind spots",
    "critical thinking",
    "assumptions",
    "cognitive biases",
  ],
  authors: [{ name: "The Blind Spot" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0b0d12] text-slate-100 selection:bg-amber-400 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
