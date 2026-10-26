const MINI_SERVIDOR_URL =
  process.env.MINI_SERVIDOR_URL || "http://localhost:4000";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/mini/:path*", destination: `${MINI_SERVIDOR_URL}/:path*` },
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
    ];
  },
};
