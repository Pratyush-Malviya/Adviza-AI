import { getPlatformClient } from "@/lib/super-admin/auth";

export interface AnnouncementBannerContent {
  enabled: boolean;
  badge: string;
  text: string;
  ctaText: string;
  ctaLink: string;
}

export interface HeroContent {
  badge: string;
  headline: string;
  subheadline: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  trustMetric: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface TrustStatsContent {
  stats: StatItem[];
}

export interface TestimonialItem {
  quote: string;
  author: string;
  title: string;
  firm: string;
  rating: number;
}

export interface TestimonialsContent {
  items: TestimonialItem[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqsContent {
  items: FaqItem[];
}

// Built-in high quality defaults ensuring instant zero-latency rendering
export const DEFAULT_CMS_CONTENT = {
  announcement_banner: {
    enabled: true,
    badge: "New Release",
    text: "Adviza v2.4 introduces Deterministic Portfolio Drift & SEC 204-2 Exam Export",
    ctaText: "Explore the Platform",
    ctaLink: "/platform",
  } as AnnouncementBannerContent,

  hero: {
    badge: "Institutional Wealth Management AI",
    headline: "Autonomous Execution Workspace for High-Performing Wealth Advisors",
    subheadline:
      "Adviza handles client meeting dossiers, real-time audio transcription, deterministic portfolio drift analysis, and SEC/FINRA compliance records — freeing your advisors to focus 100% on clients.",
    primaryCtaText: "Start 14-Day Firm Trial",
    primaryCtaLink: "/auth/signup",
    secondaryCtaText: "Schedule Institutional Demo",
    secondaryCtaLink: "/contact",
    trustMetric: "Trusted by 450+ RIA firms managing over $18.4 Billion in combined AUM",
  } as HeroContent,

  trust_stats: {
    stats: [
      { value: "$18.4B+", label: "AUM Monitored & Analyzed" },
      { value: "6.2 hrs", label: "Saved per Advisor / Week" },
      { value: "99.8%", label: "Compliance Exam Accuracy" },
      { value: "0%", label: "Client Data Used for LLM Training" },
    ],
  } as TrustStatsContent,

  testimonials: {
    items: [
      {
        quote:
          "Adviza completely transformed our advisory operations. Before Adviza, each advisor spent 45 minutes compiling meeting notes and CRM updates. Now it happens automatically before the client even walks out the door.",
        author: "Eleanor Vance, CFP®",
        title: "Managing Principal",
        firm: "Beacon Wealth Partners ($1.4B AUM)",
        rating: 5,
      },
      {
        quote:
          "As Chief Compliance Officer, our biggest risk was unstructured communication and incomplete suitability rationales. Adviza provides a tamper-proof, SHA-256 hash-verified evidence trail that made our SEC examination seamless.",
        author: "Marcus Sterling, JD",
        title: "Chief Compliance Officer",
        firm: "Apex Private Wealth ($820M AUM)",
        rating: 5,
      },
      {
        quote:
          "The deterministic portfolio drift calculations are rock-solid. Other AI tools hallucinate allocation math; Adviza executes mathematical rebalancing with human-in-the-loop sign-off. Outstanding engineering.",
        author: "David Chen, CFA",
        title: "Chief Investment Officer",
        firm: "Cascade Family Office ($2.6B AUM)",
        rating: 5,
      },
    ],
  } as TestimonialsContent,

  faqs: {
    items: [
      {
        question: "Does Adviza use our confidential client data to train public AI models?",
        answer:
          "Absolutely not. Adviza enforces a strict Zero-Data Retention (ZDR) architecture with all LLM providers (AWS Bedrock, NVIDIA NIM, Google Cloud Vertex). Your client transcripts, financial records, and PII are never retained, logged, or used for model training under any circumstance.",
      },
      {
        question: "How does Adviza support SEC Rule 204-2 and FINRA Rule 17a-4?",
        answer:
          "Every meeting dossier, audio transcript, action item, and portfolio recommendation is anchored into a Write-Once-Read-Many (WORM) compliant immutable audit ledger with cryptographic SHA-256 hash chaining. When auditors request proof, CCOs can generate a tamper-evident compliance packet in one click.",
      },
      {
        question: "Which custodians and CRMs does Adviza integrate with?",
        answer:
          "Adviza connects natively with major custodian feeds (Charles Schwab, Fidelity Institutional, BNY Mellon Pershing) and leading wealth management CRMs (Salesforce Financial Services Cloud, Wealthbox, Redtail) through secure OAuth2 and canonical REST connectors.",
      },
      {
        question: "What is the onboarding and setup timeline for an RIA firm?",
        answer:
          "A typical firm onboarding takes less than 24 hours. Once your Organization Admin configures your firm regulatory profile and invites team members, advisors can begin conducting meetings and generating briefings immediately without complex software installations.",
      },
    ],
  } as FaqsContent,
};

/**
 * Fetch published website content by section key with fallback defaults.
 */
export async function getWebsiteContent<T>(sectionKey: keyof typeof DEFAULT_CMS_CONTENT): Promise<T> {
  try {
    const platformClient = getPlatformClient();
    const { data, error } = await platformClient
      .from("website_content")
      .select("content, is_published")
      .eq("section_key", sectionKey)
      .eq("is_published", true)
      .single();

    if (!error && data?.content) {
      return data.content as T;
    }
  } catch {
    // Graceful fallback to built-in default content
  }

  return DEFAULT_CMS_CONTENT[sectionKey] as unknown as T;
}
