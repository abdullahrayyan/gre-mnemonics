/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Every route is pre-rendered from a local JSON file — there is no API, no
  // database and no request-time work — so the whole app exports to plain HTML
  // and deploys to any static host with no server behind it.
  output: 'export',
  // JIT workspace packages ship TypeScript source; Next transpiles them.
  transpilePackages: ['@mnemonic/ui'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
