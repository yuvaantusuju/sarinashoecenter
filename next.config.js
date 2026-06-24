const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Images from external domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Use unoptimized images for Cloudflare compatibility
    unoptimized: true,
  },
};

module.exports = nextConfig;
