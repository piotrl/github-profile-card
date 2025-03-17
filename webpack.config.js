const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');
const PACKAGE = require('./package.json');

const ENV = process.env.WEBPACK_ENV;
const libraryName = 'gh-profile-card';
const banner = `
${PACKAGE.name} - ${PACKAGE.version} | ${PACKAGE.license}
(c) 2014 - ${new Date().getFullYear()} ${PACKAGE.author} | ${PACKAGE.homepage}
`;

module.exports = {
  entry: './src/gh-widget-init.ts',
  output: {
    filename: `${libraryName}.min.js`,
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [new CleanWebpackPlugin(), new webpack.BannerPlugin(banner)],
  mode: 'production',
  devtool: ENV === 'dev' ? 'inline-source-map' : false,
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
