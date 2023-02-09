const webpack = require('webpack');
const path = require('path');
const fileSystem = require('fs');
const env = require('./utils/env');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

// load the secrets
var alias = {};

var secretsPath = path.join(__dirname, 'secrets.' + env.NODE_ENV + '.js');

// var imgFileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg'];

// var fontFileExtensions = ['eot', 'otf', 'ttf', 'woff', 'woff2'];

if (fileSystem.existsSync(secretsPath)) {
  alias['secrets'] = secretsPath;
}

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
      // {
      //   test: new RegExp('.(' + imgFileExtensions.join('|') + ')$'),
      //   type: 'asset/resource',
      //   exclude: /node_modules/,
      //   generator: {
      //     filename: 'img/[name].[ext]'
      //   }
      // },
      // {
      //   test: new RegExp('.(' + fontFileExtensions.join('|') + ')$'),
      //   type: 'asset/resource',
      //   exclude: /node_modules/,
      //   generator: {
      //     filename: 'fonts/[name].[ext]'
      //   }
      // },
      {
        test: /\.html$/,
        use: ['html-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
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
        // {
        //   from: 'node_modules/tw-elements/dist/js/index.min.js',
        //   to: 'vendor/tw-elements'
        // },
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
    new WriteFilePlugin()
  ]
};

if (env.NODE_ENV === 'development') {
  options.devtool = 'cheap-module-eval-source-map';
} else {
  options.devtool = false;
}

module.exports = options;
