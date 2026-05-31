/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Disable client-side router cache for dynamically rendered pages.
    // Without this, router.push('/fabrics') can serve a stale RSC payload
    // from the cache even after a server mutation + revalidatePath.
    staleTimes: {
      dynamic: 0,
    },
  },
  // Prevent webpack from bundling ws and its native addon (bufferutil).
  // Node.js loads them natively at runtime instead, avoiding the
  // "bufferUtil.mask is not a function" error in server components.
  serverExternalPackages: ["ws", "bufferutil"],
};

export default nextConfig;
