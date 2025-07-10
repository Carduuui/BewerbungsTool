/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      // Ermöglicht absolute Imports
      esmExternals: 'loose'
    }
  };
  
  export default nextConfig;