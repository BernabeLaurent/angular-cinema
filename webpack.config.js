const webpack = require('webpack');
const dotenv = require('dotenv');
const fs = require('fs');

module.exports = () => {
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

  return {
    plugins: [
      new webpack.DefinePlugin(envKeys)
    ]
  };
};
