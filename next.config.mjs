// Cloudflare binding emulation for `next dev` spawns miniflare -> workerd, whose prebuilt
// binary needs glibc 2.35 (this machine has 2.31) and dies with EPIPE. No CF bindings are
// used locally, so it is opt-in: set CF_DEV_BINDINGS=1 on a glibc >= 2.35 machine.
if (process.env.NODE_ENV === "development" && process.env.CF_DEV_BINDINGS === "1") {
  const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
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
