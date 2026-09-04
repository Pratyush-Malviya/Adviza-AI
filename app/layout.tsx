import type { Metadata, Viewport } from "next";
import Script from "next/script";
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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://adviza.ai";

export const metadata: Metadata = {
  title: {
    default: "Adviza AI | Enterprise AI Operating System for Wealth Management",
    template: "%s",
  },
  description:
    "AI agents that handle client briefings, meeting intelligence, and compliance documentation — so wealth advisors can focus on clients, not admin.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/icon.png",
  },
  keywords: [
    "Adviza AI",
    "wealth management AI",
    "advisor automation",
    "meeting intelligence",
    "client briefing",
    "compliance automation",
    "RIA software",
    "family office AI",
    "SEC 204-2 compliance",
    "FINRA meeting notes",
  ],
  openGraph: {
    type: "website",
    locale: "en",
    url: siteUrl,
    siteName: "Adviza AI",
    title: "Adviza AI | Enterprise AI Operating System for Wealth Management",
    description:
      "AI agents that handle client briefings, meeting intelligence, and compliance documentation — so wealth advisors can focus on clients, not admin.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Adviza AI — Enterprise AI Operating System for Wealth Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adviza AI | Enterprise AI Operating System for Wealth Management",
    description:
      "AI agents that handle client briefings, meeting intelligence, and compliance documentation — so wealth advisors can focus on clients, not admin.",
    creator: "@adviza_ai",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF5F0",
  width: "device-width",
  initialScale: 1,
};

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-MFTTZL3C";

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
      <head>
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />
      </head>
      <body
        className="font-sans antialiased bg-[#FAF5F0] text-zinc-900 min-h-screen selection:bg-rose-200 selection:text-rose-900"
        suppressHydrationWarning
      >
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
