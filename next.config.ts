import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    NEXT_PUBLIC_PUSHER_KEY: 'cbefe2fef0f08ab319f4',
    NEXT_PUBLIC_PUSHER_CLUSTER: 'sa1',
    PUSHER_APP_ID: '2131067',
    PUSHER_SECRET: '3ded18905f7c8c76de96',
  },
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
