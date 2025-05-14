import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;

export async function redirects() {
  return [
    {
      source: "/",
      destination: "/home",
      permanent: true,
    },
  ];
}
