import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Adviza | AI Execution Workspace for Wealth Advisors",
    template: "%s | Adviza",
  },
  description:
    "AI agents that handle client briefings, meeting intelligence, and compliance documentation — so your advisors can focus on clients, not admin.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/icon.png",
  },
  keywords: [
    "Adviza",
    "wealth management AI",
    "advisor automation",
    "meeting intelligence",
    "client briefing",
    "compliance automation",
    "RIA software",
    "family office AI",
  ],
  openGraph: {
    type: "website",
    title: "Adviza — AI for Wealth Management",
    description:
      "AI Execution Workspace for Wealth Management Advisors — powered by Amazon Bedrock.",
    siteName: "Adviza",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adviza — AI for Wealth Management",
    description:
      "AI agents that handle the admin so advisors can focus on clients.",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF5F0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="font-sans antialiased bg-[#FAF5F0] text-zinc-900 min-h-screen selection:bg-rose-200 selection:text-rose-900"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
