/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // PWA configuration will be added here after installing next-pwa
  // Uncomment after running: npm install next-pwa
  /*
  ...withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development'
  })
  */
}

module.exports = nextConfig
