/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["picsum.photos"], // Add picsum.photos to allowed image domains
  },
};

module.exports = nextConfig;
