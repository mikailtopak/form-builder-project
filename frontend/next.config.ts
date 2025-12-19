import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // swcMinify: true, // BU SATIRI SİL veya yorum satırı yap
  output: 'standalone', // Docker için iyi
  experimental: {
    // Gerekirse ek özellikler
  },
};

export default nextConfig;