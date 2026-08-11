/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' }
    ]
  },
  // Lets the dev server work if you open it from another device on your
  // network (e.g. testing on your phone) instead of just localhost.
  // Ignored harmlessly on Next.js versions that don't support this option.
  allowedDevOrigins: ['192.168.0.213', 'localhost']
};

module.exports = nextConfig;
