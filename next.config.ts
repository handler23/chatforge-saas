import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Fix Vercel "modifyConfig" build: path must be a string (not undefined)
  images: {
    loader: "default",
    path: "/_next/image",
    unoptimized: true,
  },
};

export default nextConfig;
