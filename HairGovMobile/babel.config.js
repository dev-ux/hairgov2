module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@screens': './src/screens',
            '@components': './src/components',
            '@navigation': './src/navigation',
            '@assets': './src/assets',
            '@config': './src/config',
          },
        },
      ],
      ['react-native-reanimated/plugin', {
        relativeSourceLocation: true,
      }],
    ],
  };
};
