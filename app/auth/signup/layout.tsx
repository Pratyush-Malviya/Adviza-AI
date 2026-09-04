import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started — Free Trial | Adviza AI",
  description: "Create your Adviza AI advisor account and start your 14-day free trial.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
