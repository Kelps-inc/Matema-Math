import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serve imagens otimizadas (AVIF/WebP) via next/image, com cache longo.
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dias
  },
  // Remove console.* (exceto error/warn) do bundle de produção.
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  // Comprime respostas e omite o header X-Powered-By.
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
