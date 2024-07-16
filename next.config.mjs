/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  reactStrictMode: true,
  images: {
    domains: ["designverification.ai","lirp.cdn-website.com"],
  },
};

export default nextConfig;
