/**
 * @type {import('next').NextConfig}
 * */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      const copy = { ...config };
      copy.resolve.fallback = { fs: false, path: false, child_process: false, util: false };
      return copy;
    }
    return config;
  },
  experimental: {
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
};

module.exports = nextConfig;
