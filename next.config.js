/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // These ship WebAssembly; load them from node_modules at runtime instead of
    // bundling them: Cardano's serialization library (lib/cardanoRecord.js) and
    // Midnight's contract runtime (lib/midnight/coverageProof.js).
    serverComponentsExternalPackages: [
      "@emurgo/cardano-serialization-lib-nodejs",
      "@midnight-ntwrk/compact-runtime",
      "@midnightntwrk/onchain-runtime-v4",
    ],
  },
  webpack(config, { isServer }) {
    if (isServer) {
      // Midnight's runtime is an ES module whose package "exports" webpack
      // refuses to resolve ("Default condition should be last one"). Leave it
      // to Node: import() it at runtime instead of bundling it.
      const midnight = ({ request }, callback) =>
        request === "@midnight-ntwrk/compact-runtime" || request?.startsWith("@midnightntwrk/")
          ? callback(null, `import ${request}`)
          : callback();
      config.externals = [midnight, ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean))];
    }
    return config;
  },
};

module.exports = nextConfig;
