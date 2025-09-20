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
      providedExports: true,
      innerGraph: true,
      concatenateModules: true,
      mangleExports: 'size',
      splitChunks: {
        chunks: 'all',
        maxSize: 350000, // Reduced from 400KB
        minSize: 20000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
            maxSize: 250000, // Reduced from 300KB
            enforce: true,
          },
          material: {
            test: /[\\/]node_modules[\\/]@angular[\\/]material[\\/]/,
            name: 'angular-material',
            priority: 20,
            chunks: 'all',
            maxSize: 150000, // Reduced from 200KB
            enforce: true,
          },
          cdk: {
            test: /[\\/]node_modules[\\/]@angular[\\/]cdk[\\/]/,
            name: 'angular-cdk',
            priority: 15,
            chunks: 'all',
            maxSize: 100000,
            enforce: true,
          },
          common: {
            minChunks: 2,
            priority: -10,
            reuseExistingChunk: true,
            maxSize: 100000, // Reduced from 150KB
          }
        }
      }
    };

    // Add production plugins for better tree-shaking
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
        'ngDevMode': false,
        'ngI18nClosureMode': false,
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      })
    );

    // Enhanced tree-shaking for specific modules
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        // Ensure we use ES modules where possible
        'rxjs/operators': 'rxjs/operators',
        'rxjs': 'rxjs',
      }
    };

    return config;
  }

  return baseConfig;
};
