/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  enablePrerenderSourceMaps: true,
  //   reactCompiler: true,
  typedRoutes: true,
  experimental: {
    globalNotFound: true,
  },
}

export default nextConfig
