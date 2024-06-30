import webpack from 'webpack';
import path from 'path';
import env from './utils/env.js';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import WriteFilePlugin from 'write-file-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fileExtensions = [
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

export const options = {
  mode: env.NODE_ENV,
  entry: {
    popup: path.join(__dirname, 'src', 'js', 'popup.js'),
    options: path.join(__dirname, 'src', 'js', 'options.js'),
    serviceWorker: path.join(__dirname, 'src', 'js', 'serviceWorker.js'),
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
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV)
    }),
    new webpack.DefinePlugin({
      'process.env.LOG_LEVEL': JSON.stringify(env.LOG_LEVEL)
    }),
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

if (env.IS_DEV) {
  options.devtool = 'eval-cheap-module-source-map';
} else {
  options.devtool = false;
}
