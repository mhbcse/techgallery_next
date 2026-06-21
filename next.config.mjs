import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.techgallerybd.com',
      },
    ],
  },
}

export default nextConfig
