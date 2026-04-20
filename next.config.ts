import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Vary",
            value: "RSC, Next-Router-State-Tree, Next-Router-Prefetch",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
