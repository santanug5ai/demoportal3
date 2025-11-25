/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ob-digital-portal/shared'],
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/demoportal3' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/demoportal3/' : '',
}

module.exports = nextConfig
