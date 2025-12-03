/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Enable static export (for shared hosting)
  images: {
    unoptimized: true, // Required for static export to disable Image Optimization
  },
  trailingSlash: true, // Optional: helps avoid 404s in shared hosting
};

module.exports = nextConfig;