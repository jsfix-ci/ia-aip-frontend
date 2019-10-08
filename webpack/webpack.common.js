const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

const path = require('path');

const serverConfig = {
  entry: [
    './app/app.ts'
  ],
  target: 'node',
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  externals: [ nodeExternals() ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          'ts-loader',
        ]
      }
    ]
  }
};

const clientConfig = {
  entry: [
    './client/main.ts',
    './app/assets/scss/application.scss'
  ],
  watch: true,
  target: 'web',
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: 'all.js'
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        loader: [
          MiniCSSExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: path.resolve('node_modules/govuk-frontend/govuk/assets/'), to: 'assets' }
    ]),
    new MiniCSSExtractPlugin({
      filename: '[name].css'
    })
  ],
};

const commonConfig = {
    server: serverConfig,
    client: clientConfig
}

module.exports = commonConfig;