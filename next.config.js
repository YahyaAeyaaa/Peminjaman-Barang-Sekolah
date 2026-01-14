/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Exclude Prisma from middleware bundling (Edge runtime)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Exclude Prisma Client from webpack bundling
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@prisma/client': 'commonjs @prisma/client',
        '.prisma/client': 'commonjs .prisma/client',
      });
    }

    config.externals = config.externals || [];
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });

    return config;
  },
};

module.exports = nextConfig;

