/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ["app", "components", "lib"]
  },
  experimental: {
    typedRoutes: true
  },
  reactStrictMode: true,
  transpilePackages: ["@clawnews/core"]
};

export default nextConfig;
