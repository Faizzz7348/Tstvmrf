# Quick Setup Commands

## 1. Install PWA Package
```bash
npm install next-pwa
```

## 2. Update next.config.js

Replace the content with:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = withPWA(nextConfig)
```

## 3. Create Icons

Put these files in `/public/` folder:
- `icon-192x192.png` (192x192 pixels)
- `icon-512x512.png` (512x512 pixels)

Use your app logo or create simple colored squares for testing.

## 4. Test

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Quick Icon Creation

If you don't have icons yet, you can:

1. Use any image editor to create 2 PNG files
2. Or use online tool: https://realfavicongenerator.net/
3. Or use placeholder icons for testing

## Verify PWA Setup

After running, open Chrome DevTools:
1. Go to Application tab
2. Check Manifest section
3. Check Service Workers section
4. Look for "Add to Home Screen" prompt

Done! Your app is now a PWA. 🚀
