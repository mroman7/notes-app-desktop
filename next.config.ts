import type { NextConfig } from "next";

const nextConfig = {
  output: 'export', // Required for Tauri
  images: { unoptimized: true } 
};
export default nextConfig;
