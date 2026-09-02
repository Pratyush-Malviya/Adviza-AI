import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adviza AI — Enterprise AI Operating System for Wealth Management & RIAs",
  description: "Fiduciary AI orchestration engine for Registered Investment Advisors. Autonomous meeting intelligence, FIX protocol custodial rebalancing, Mem0 pgvector memory, and SEC 206(4)-1 / FINRA 2210 compliance automation.",
  keywords: ["Wealth Management AI", "RIA AI Assistant", "Fiduciary AI", "FIX Protocol", "Composio Wealth Tools", "FINRA 2210 Compliance"],
  authors: [{ name: "Adviza AI Enterprise" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#FAF5F0] text-[#121217]">
        {children}
      </body>
    </html>
  );
}
