import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // Suppress AWS SDK warnings in Next.js
  serverExternalPackages: ["@aws-sdk/client-bedrock-runtime", "@aws-sdk/client-transcribe", "@aws-sdk/client-s3"],
};

export default nextConfig;

