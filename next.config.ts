import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // This exports static HTML/JS files
  trailingSlash: true, // Exports pages as /route/index.html instead of /route.html
  images: {
    unoptimized: true  // Required for static export
  }
};

export default nextConfig;