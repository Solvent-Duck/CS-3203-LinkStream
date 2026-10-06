import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";
interface LayoutProps {
  children: React.ReactNode;
  params?: Promise<{ [key: string]: string }>;
}

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  fallback: ["system-ui", "sans-serif"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "LinkStream — Everything your team needs, one link away",
  description:
    "LinkStream turns scattered work links into a simple, searchable home for your team.",
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" className={`${dmSans.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
