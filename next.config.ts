import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel handles builds natively — do NOT use output: "standalone" on Vercel
     (it prevents public/ static files from being served correctly). */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
