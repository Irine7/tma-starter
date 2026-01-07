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
  ],
};

export default nextConfig;
