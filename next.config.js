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
  // Vercel 배포 최적화
  swcMinify: true,
};

module.exports = nextConfig;

