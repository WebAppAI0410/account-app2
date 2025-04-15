import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // output: 'export', // Reverted: Removed static export setting
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
