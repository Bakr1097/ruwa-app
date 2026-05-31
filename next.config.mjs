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
};

export default nextConfig;
