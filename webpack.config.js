const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin')
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');

const dist = path.resolve(__dirname, 'dist');

const baseConfig = {
  mode: 'production',

  entry: {
    tomblet: './www/index.js',
  },

  resolve: {
    extensions: ['.js', '.wasm'],
  },

  plugins: [
    new WasmPackPlugin({
      crateDirectory: __dirname,
      extraArgs: '--dev',
      outName: 'wasm-playground',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "./www/index.html", to: "index.html" }
      ]
    })
  ],

  experiments: {
    asyncWebAssembly: true,
  },
}

const devServerConfig = {
  devServer: {
    host: '127.0.0.1',
    port: 8000,
  },
};

const outputConfig = {
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: 'index.js'
  }
}

module.exports = (_env) => {
  return [{
    ...baseConfig,
    ...devServerConfig,
    ...outputConfig,
  }];
};
