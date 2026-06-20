/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @libsql/client is a server-only dependency; keep it external to the bundle.
  serverExternalPackages: ["@libsql/client"],
};

export default nextConfig;
