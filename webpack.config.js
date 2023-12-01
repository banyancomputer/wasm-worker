const path = require('path');

const CopyPlugin = require('copy-webpack-plugin')
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');

const config = {
  mode: "development",
  entry: {
    index: "./www/index.ts",
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "./www/index.html", to: "./index.html" }],
    }),
  ],

  experiments: {
    asyncWebAssembly: true,
  },

  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    modules: [
      path.resolve(__dirname, "./www"),
      path.resolve(__dirname, "./node_modules"),
    ],
  },

  devServer: {
    hot: "only",
    port: 8000,
    allowedHosts: "all",
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
        },
      },
    ],
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
};

const workerConfig = {
  mode: "development",
  entry: {
    index: "./www/worker.ts",
  },
  plugins: [
    new WasmPackPlugin({
      crateDirectory: __dirname,
    }),
  ],

  experiments: {
    asyncWebAssembly: true,
  },

  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    modules: [
      path.resolve(__dirname, "./www"),
      path.resolve(__dirname, "./node_modules"),
    ],
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
        },
      },
    ],
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "worker.js",
  },

  target: "webworker",
};

module.exports = (_env) => {
  return [
    config,
    workerConfig
  ]
}