/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, // Disabling strict mode to prevent double-invokation specific issues during dev
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
        ],
    },
}

module.exports = nextConfig
