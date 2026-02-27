import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Google profile photos (OAuth avatar_url)
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // Supabase Storage (if profile photos are ever uploaded there)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

export default nextConfig
