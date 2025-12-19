/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  typescript: {
    // We keep this strict so build fails if types truly break in future,
    // which is what we want for a long-lived product.
    ignoreBuildErrors: false,
  },
  eslint: {
    // Build should fail on real ESLint errors; you're already clean.
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
