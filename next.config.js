/**
 * @type {import('next').NextConfig}
 * */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Enables the styled-components SWC transform
    styledComponents: true,

    // Allows Yarn PnP to work right now
    swcFileReading: false,
  },
  images: {
    domains: ['images.ctfassets.net'],
  },
};

module.exports = nextConfig;
