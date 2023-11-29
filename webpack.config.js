const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin')
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');

const dist = path.resolve(__dirname, 'dist');

const baseConfig = {
  mode: 'development',

  devServer: {
    port: 8000,
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "./www/index.html", to: "index.html" }
      ]
    })
  ],

  entry: './www/index.js',

  resolve: {
    extensions: ['.js', '.wasm'],
  },

  output: {
    path: dist,
    filename: 'index.js'
  }
}

const workerConfig = {
  mode: 'development',

  entry: './www/worker.js',
  
  plugins: [
    new WasmPackPlugin({
      crateDirectory: __dirname
    })
  ],

  experiments: {
    asyncWebAssembly: true,
  }, 
  
  resolve: {
    extensions: ['.js', '.wasm'],
  },

  output: {
    path: dist,
    filename: 'worker.js'
  },

  target: 'webworker',
}

module.exports = (_env) => {
  return [
    baseConfig,
    workerConfig
  ]
}