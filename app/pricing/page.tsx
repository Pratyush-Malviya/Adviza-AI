import type { Metadata } from "next";
import { PricingView } from "@/components/marketing/pricing-view";

export const metadata: Metadata = {
  title: "Pricing & Plans | Adviza AI",
  description:
    "Transparent, fiduciary-grade pricing for RIAs, family offices, and wealth institutions. Choose between Starter, Advisor Pro, and Enterprise RIA plans with 14-day free trial.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing & Plans | Adviza AI",
    description:
      "Transparent, fiduciary-grade pricing for RIAs, family offices, and wealth institutions. Choose between Starter, Advisor Pro, and Enterprise RIA plans.",
    url: "https://adviza.ai/pricing",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Adviza AI Pricing" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing & Plans | Adviza AI",
    description:
      "Transparent, fiduciary-grade pricing for RIAs, family offices, and wealth institutions.",
    images: ["/og-image.png"],
  },
};

export default function PricingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Adviza AI Advisor Workspace",
    "image": "https://adviza.ai/og-image.png",
    "description": "Autonomous execution operating system for modern wealth management firms, RIAs, and multi-family offices.",
    "brand": {
      "@type": "Brand",
      "name": "Adviza AI"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Starter Plan",
        "price": "0",
        "priceCurrency": "USD",
        "description": "1 advisor workspace, 10 client meetings/month, automated pre-meeting dossiers, basic compliance notes.",
        "url": "https://adviza.ai/pricing",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "Advisor Pro Plan",
        "price": "79",
        "priceCurrency": "USD",
        "priceValidUntil": "2027-12-31",
        "description": "Unlimited client meetings, real-time ambient scribe, portfolio drift engine, two-way CRM sync, multi-model AI routing.",
        "url": "https://adviza.ai/pricing",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "Enterprise RIA Plan",
        "price": "199",
        "priceCurrency": "USD",
        "priceValidUntil": "2027-12-31",
        "description": "SEC 204-2 / FINRA 17a-4 WORM exam export, custom model version pinning, dedicated CCO onboarding, branded advisor workspaces.",
        "url": "https://adviza.ai/pricing",
        "availability": "https://schema.org/InStock"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PricingView />
    </>
  );
}
