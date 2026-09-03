import { MarketingNavbar } from "@/components/marketing/navbar";
import { ContiantHeroExact } from "@/components/marketing/contiant-hero-exact";
import { ContiantPartnersExact } from "@/components/marketing/contiant-partners-exact";
import { ContiantDarkSectionExact } from "@/components/marketing/contiant-dark-section-exact";
import { ContiantPowerGridExact } from "@/components/marketing/contiant-powergrid-exact";
import { ContiantSandSectionExact } from "@/components/marketing/contiant-sand-section-exact";
import { MarketingFooter } from "@/components/marketing/footer";

export const metadata = {
  title: "Adviza | Instant Intelligence with Wealth Advisory",
  description:
    "Our advanced AI technology and fiduciary guardrails provide a safe and reliable way to prepare meetings, rebalance portfolios, and seal audit records.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#1C242D] flex flex-col selection:bg-[#7935FF] selection:text-white">
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
