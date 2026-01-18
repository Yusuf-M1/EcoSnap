/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, // Disabling strict mode to prevent double-invokation specific issues during dev
    env: {
        NEXT_PUBLIC_SUPABASE_URL: 'https://kurmbcmdlmzijtxrshtq.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1cm1iY21kbG16aWp0eHJzaHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1OTYyNDUsImV4cCI6MjA4MjE3MjI0NX0.jZ2oVWJnzK_ian-mTJpR8kKwhH60Pu3Th6K-e8RwT8U',
    },
}

module.exports = nextConfig
