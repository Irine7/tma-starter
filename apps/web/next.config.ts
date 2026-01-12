import type { NextConfig } from "next";
import { config } from 'dotenv';
import path from 'path';

// Load .env from monorepo root
config({ path: path.resolve(__dirname, '../../.env') });

const nextConfig: NextConfig = {
  // Allow ngrok origins in development
  allowedDevOrigins: [
    '*.ngrok-free.app',
    '*.ngrok.io',
    '*.trycloudflare.com',
  ],
  async headers() {
    return [
      {
        // Matching all API routes
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*', // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
