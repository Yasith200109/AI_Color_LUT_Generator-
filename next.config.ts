import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external IPs (like phone or another PC on same network) to access dev server without HMR errors
  // @ts-ignore - this is a valid Next.js config option but might not be typed in all NextConfig versions
  allowedDevOrigins: ['192.168.137.92', '100.68.32.10'],
  // @ts-ignore - Next.js types might not recognize appIsrStatus depending on the exact version
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
};

export default nextConfig;
