/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '4promotional.net',
        port: '9090',
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },
}

export default nextConfig
