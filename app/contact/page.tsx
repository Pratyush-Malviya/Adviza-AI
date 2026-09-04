import type { Metadata } from "next";
import { ContactView } from "@/components/marketing/contact-view";

export const metadata: Metadata = {
  title: "Contact Enterprise Sales & Support | Adviza AI",
  description:
    "Speak with an Adviza AI solutions architect. Inquire about custom RIA integrations, private VPC deployments, enterprise licensing, or schedule an executive walkthrough.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Enterprise Sales & Support | Adviza AI",
    description:
      "Speak with an Adviza AI solutions architect. Inquire about custom RIA integrations, private VPC deployments, and enterprise licensing.",
    url: "https://adviza.ai/contact",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Contact Adviza AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Enterprise Sales & Support | Adviza AI",
    description:
      "Speak with an Adviza AI solutions architect about RIA integrations, security, and enterprise licensing.",
    images: ["/og-image.png"],
  },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Adviza AI",
    "url": "https://adviza.ai/contact",
    "description": "Get in touch with Adviza AI for enterprise sales, integrations, and advisory support.",
    "mainEntity": {
      "@type": "Organization",
      "name": "Adviza AI",
      "url": "https://adviza.ai",
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "email": "support@adviza.ai",
          "contactType": "customer support",
          "availableLanguage": ["English"]
        },
        {
          "@type": "ContactPoint",
          "email": "enterprise@adviza.ai",
          "contactType": "sales",
          "availableLanguage": ["English"]
        }
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactView />
    </>
  );
}
