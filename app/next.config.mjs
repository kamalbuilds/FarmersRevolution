/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false }; // Fix for Pinata
    return config;
  },
};

export default nextConfig;
