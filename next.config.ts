import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse'],
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', 'gsap', 'zustand'],
};

export default nextConfig;
