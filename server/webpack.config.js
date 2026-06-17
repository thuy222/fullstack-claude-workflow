// Nest builds with webpack (monorepo mode bundles + resolves @app/* aliases).
// Prisma 7's generated client uses ESM-style `.js` import specifiers that
// actually point at `.ts` source files. Teach webpack to resolve `.js` → `.ts`.
module.exports = (config) => {
  config.resolve = config.resolve || {};
  config.resolve.extensionAlias = {
    ...(config.resolve.extensionAlias || {}),
    '.js': ['.ts', '.js'],
  };
  return config;
};
