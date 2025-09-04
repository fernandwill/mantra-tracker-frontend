import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Fix for Windows Watchpack errors
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/System Volume Information/**',
          '**/pagefile.sys',
          '**/swapfile.sys',
          'C:/System Volume Information/**',
          'C:/pagefile.sys',
          'C:/swapfile.sys'
        ]
      };
    }
    return config;
  }
};

export default nextConfig;
