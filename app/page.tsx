import { MarketingNavbar } from "@/components/marketing/navbar";
import { ContiantHeroExact } from "@/components/marketing/contiant-hero-exact";
import { ContiantPartnersExact } from "@/components/marketing/contiant-partners-exact";
import { ContiantDarkSectionExact } from "@/components/marketing/contiant-dark-section-exact";
import { ContiantPowerGridExact } from "@/components/marketing/contiant-powergrid-exact";
import { ContiantSandSectionExact } from "@/components/marketing/contiant-sand-section-exact";
import { MarketingFooter } from "@/components/marketing/footer";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adviza AI | Enterprise AI Operating System for Wealth Management",
  description:
    "Empowering wealth managers, RIAs, and multi-family offices with autonomous meeting briefings, ambient note capture, portfolio drift auditing, and SEC 204-2 compliance.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Adviza AI | Enterprise AI Operating System for Wealth Management",
    description:
      "Empowering wealth managers, RIAs, and multi-family offices with autonomous meeting briefings, ambient note capture, portfolio drift auditing, and SEC 204-2 compliance.",
    url: "https://adviza.ai",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Adviza AI Platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adviza AI | Enterprise AI Operating System for Wealth Management",
    description:
      "Empowering wealth managers, RIAs, and multi-family offices with autonomous meeting briefings, ambient note capture, and SEC 204-2 compliance.",
    images: ["/og-image.png"],
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://adviza.ai/#website",
        "url": "https://adviza.ai",
        "name": "Adviza AI",
        "description": "Enterprise AI Operating System for Wealth Management & RIAs",
        "publisher": {
          "@id": "https://adviza.ai/#organization"
        },
        "inLanguage": "en-US"
      },
      {
        "@type": "Organization",
        "@id": "https://adviza.ai/#organization",
        "name": "Adviza AI",
        "url": "https://adviza.ai",
        "logo": {
          "@type": "ImageObject",
          "url": "https://adviza.ai/icon.png",
          "width": 512,
          "height": 512
        },
        "sameAs": [
          "https://twitter.com/adviza_ai",
          "https://www.linkedin.com/company/adviza-ai"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "support@adviza.ai",
          "contactType": "customer support",
          "availableLanguage": ["English"]
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white text-[#1C242D] flex flex-col selection:bg-[#7935FF] selection:text-white">
      {/* Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Header matching Contiant */}
      <MarketingNavbar />

      <main className="flex-1">
        {/* Section 1: Hero matching Screenshot 1 */}
        <ContiantHeroExact />

        {/* Section 2: Partner Strip matching Screenshot 2 */}
        <ContiantPartnersExact />

        {/* Section 3: Deep Slate Mega-Container matching Screenshot 3 */}
        <ContiantDarkSectionExact />

        {/* Section 4: One Advisory Power Grid matching Screenshot 4 */}
        <ContiantPowerGridExact />

        {/* Section 5: Warm Sand / Peach Mega-Container matching Screenshot 5 */}
        <ContiantSandSectionExact />
      </main>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
