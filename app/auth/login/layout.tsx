import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advisor Login | Adviza AI",
  description: "Sign in to your Adviza AI wealth management workspace.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
