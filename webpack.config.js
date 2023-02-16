const webpack = require('webpack');
const path = require('path');
const fileSystem = require('fs');
const env = require('./utils/env');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// load the secrets
var alias = {};

var secretsPath = path.join(__dirname, 'secrets.' + env.NODE_ENV + '.js');

var fileExtensions = [
  'eot',
  'otf',
  'ttf',
  'woff',
  'woff2',
  'jpg',
  'jpeg',
  'png',
  'gif',
  'svg'
];

if (fileSystem.existsSync(secretsPath)) {
  alias['secrets'] = secretsPath;
}

const isDev = env.NODE_ENV === 'development';

var options = {
  mode: env.NODE_ENV,
  entry: {
    popup: path.join(__dirname, 'src', 'js', 'popup.js'),
    options: path.join(__dirname, 'src', 'js', 'options.js'),
    background: path.join(__dirname, 'src', 'js', 'background.js'),
    contentscript: path.join(__dirname, 'src', 'js', 'contentscript.js')
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js'
  },
  module: {
    rules: [
      // this is for bundling fonts for the popup
      {
        test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
        type: 'asset/resource',
        exclude: /node_modules/,
        generator: {
          filename: 'fonts/[name][ext]'
        }
      },
      {
        test: /\.html$/,
        use: ['html-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          // need relative asset links in the popup:
          {
            loader: 'string-replace-loader',
            options: {
              search: 'chrome-extension://__MSG_@@extension_id__',
              replace: '..',
              flags: 'g'
            }
          }
        ]
      }
    ]
  },
  resolve: {
    alias: alias
  },
  plugins: [
    // clean the build folder
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: ['build']
    }),
    // expose and write the allowed env vars on the compiled bundle
    //new webpack.EnvironmentPlugin(['NODE_ENV']),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          transform: function(content) {
            // generates the manifest file using the package.json informations
            return Buffer.from(
              // this doesn't work? fix
              JSON.stringify({
                description: process.env.npm_package_description,
                version: process.env.npm_package_version,
                ...JSON.parse(content.toString())
              })
            );
          }
        },
        // These files are for injection into websites,
        // so they need to be copied as is to the build folder.
        // used by eg contentscript
        {
          from: 'src/css/contentscript.css',
          to: 'css/contentscript.css'
        },
        {
          from: 'src/css/fonts.css',
          to: 'css/fonts.css'
        },
        {
          from: 'src/fonts',
          to: 'fonts'
        },
        {
          from: 'src/img',
          to: 'img'
        },
        {
          from: 'src/_locales',
          to: '_locales'
        }
      ]
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'popup.html'),
      filename: 'popup.html',
      chunks: ['popup']
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'options.html'),
      filename: 'options.html',
      chunks: ['options']
    }),
    new WriteFilePlugin(),
    // don't inline css in html...
    new MiniCssExtractPlugin()
  ]
};

if (isDev) {
  options.devtool = 'eval-cheap-module-source-map';
} else {
  options.devtool = false;
}

module.exports = options;
