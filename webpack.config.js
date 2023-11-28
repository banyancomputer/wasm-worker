const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin')
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');

const dist = path.resolve(__dirname, 'dist');

const baseConfig = {
  mode: 'production',

  devServer: {
    host: '127.0.0.1',
    port: 8000,
  },
  
  entry: './www/index.js',

  resolve: {
    extensions: ['.js'],
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "./www/index.html", to: "index.html" }
      ]
    })
  ],

  output: {
    path: dist,
    filename: 'index.js',
  },
}

const workerConfig = {
  mode: 'production',

  entry: './www/worker.js',

  plugins: [
    new WasmPackPlugin({
      crateDirectory: __dirname,
      extraArgs: '--dev',
      outName: 'wasm-worker-example',
    }),
  ],

  resolve: {
    extensions: ['.js', '.wasm'],
  },

  output: {
    path: dist,
    filename: 'worker.js',
  },

  target: 'webworker',
  
  experiments: {
    asyncWebAssembly: true,
  },
}

module.exports = [baseConfig, workerConfig]; 
