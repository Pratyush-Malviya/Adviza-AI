import { MarketingNavbar } from "@/components/marketing/navbar";
import { SpecHero } from "@/components/marketing/spec-hero";
import { SpecLogoStrip } from "@/components/marketing/spec-logo-strip";
import { SpecFeatures } from "@/components/marketing/spec-features";
import { SpecDashboardShowcase } from "@/components/marketing/spec-dashboard-showcase";
import { SpecStatistics } from "@/components/marketing/spec-statistics";
import { SpecSolutions } from "@/components/marketing/spec-solutions";
import { SpecCta } from "@/components/marketing/spec-cta";
import { MarketingFooter } from "@/components/marketing/footer";
import {
  getWebsiteContent,
  AnnouncementBannerContent,
} from "@/lib/cms/content";

export const metadata = {
  title: "Adviza AI | Autonomous Execution for Wealth Advisory",
  description:
    "AI agents that prepare client meeting dossiers, capture ambient audio minutes, calculate portfolio drift, and seal SEC/FINRA compliance records in real time.",
};

export default async function HomePage() {
  const banner = await getWebsiteContent<AnnouncementBannerContent>("announcement_banner");

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111827] flex flex-col selection:bg-[#4F6EF7] selection:text-white">
      {/* 1. Navbar */}
      <MarketingNavbar banner={banner} />

      <main className="flex-1">
        {/* 2. Hero Section (2-Column with 72px Headline & Floating Dashboard) */}
        <SpecHero />

        {/* 3. Client Logos (Infinite scrolling marquee strip) */}
        <SpecLogoStrip />

        {/* 4. Features (Alternating Image-Content / Content-Image Blocks) */}
        <SpecFeatures />

        {/* 5. Product Dashboard Showcase (Large mockup with tabs and soft shadows) */}
        <SpecDashboardShowcase />

        {/* 6. Statistics Section (4-column metric cards with hover lift) */}
        <SpecStatistics />

        {/* 7. Solutions (3-column cards with tailored advisory segments) */}
        <SpecSolutions />

        {/* 8. Call To Action (Dark #0F172A section with soft blue radial glow) */}
        <SpecCta />
      </main>

      {/* 9. Footer (Dark #0F172A 4-column layout with copyright bar) */}
      <MarketingFooter />
    </div>
  );
}
