/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'stream.ktict.co.kr',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;


