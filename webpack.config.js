const webpack = require('webpack');
const dotenv = require('dotenv');
const fs = require('fs');

module.exports = (config, options) => {
  let env = {};
  try {
    env = dotenv.parse(fs.readFileSync('.env'));
  } catch (error) {
    console.warn('.env file not found or unreadable. Using empty environment variables.');
  }

  const envKeys = Object.keys(env || {}).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(env[next]);
    return prev;
  }, {});

  // Base config with environment variables
  const baseConfig = {
    plugins: [
      new webpack.DefinePlugin(envKeys)
    ]
  };

  //  optimisations pour la production
  if (config && options?.configuration === 'production') {
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
      splitChunks: {
        chunks: 'all',
        maxSize: 400000, // 400KB max chunk size
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
            maxSize: 300000, // 300KB max vendor chunk
          },
          material: {
            test: /[\\/]node_modules[\\/]@angular[\\/]material[\\/]/,
            name: 'angular-material',
            priority: 20,
            chunks: 'all',
            maxSize: 200000, // 200KB max material chunk
          },
          common: {
            minChunks: 2,
            priority: -10,
            reuseExistingChunk: true,
            maxSize: 150000, // 150KB max common chunk
          }
        }
      }
    };

    // Add production plugins
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
      })
    );

    return config;
  }

  return baseConfig;
};
