import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "quickchart.io",
      },
    ],
  },
  turbopack: {
    root: path.join(__dirname, '..'),
  },
  webpack: (config) => {
    config.infrastructureLogging = {
      ...(config.infrastructureLogging || {}),
      level: "error",
    };

    return config;
  },
};

export default nextConfig;
