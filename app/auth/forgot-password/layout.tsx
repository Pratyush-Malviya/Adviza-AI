import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Adviza AI",
  description: "Reset your Adviza AI workspace account password.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
