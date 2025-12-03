/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // ✅ This enables static export
  images: {
    unoptimized: process.env.EXPORT_MODE === 'true',
  },
};

export default nextConfig;