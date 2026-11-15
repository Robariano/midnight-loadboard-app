/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Cardano's serialization library ships a WebAssembly file; load it from
    // node_modules at runtime instead of bundling it (lib/cardanoRecord.js).
    serverComponentsExternalPackages: ["@emurgo/cardano-serialization-lib-nodejs"],
  },
};

module.exports = nextConfig;
