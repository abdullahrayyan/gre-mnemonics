/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // JIT workspace packages ship TypeScript source; Next transpiles them.
  transpilePackages: ['@mnemonic/ui', '@mnemonic/types'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
