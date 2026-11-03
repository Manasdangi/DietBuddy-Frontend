module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // zustand's middleware uses `import.meta`, which breaks the web build without this
      ['babel-preset-expo', { unstable_transformImportMeta: true }],
    ],
  };
};
