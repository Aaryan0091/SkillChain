import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
