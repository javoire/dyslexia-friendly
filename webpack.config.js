import webpack from 'webpack';
import path from 'path';
import env from './utils/env.js';
// import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import WriteFilePlugin from 'write-file-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mediaFileExtensions = [
  'eot',
  'otf',
  'ttf',
  'woff',
  'woff2',
  'svg',
  'jpg',
  'jpeg',
  'png',
  'gif',
];

// const fontFileExtensions = ['eot', 'otf', 'ttf', 'woff', 'woff2'];

const extensionSrcPath = path.join(__dirname, 'src/extension');
const extensionOutPath = path.join(__dirname, 'build/extension');
const websiteSrcPath = path.join(__dirname, 'src/website');
const websiteOutPath = path.join(__dirname, 'build/website');

const sharedConfig = {
  stats: 'errors-warn',
  mode: env.NODE_ENV,
  module: {
    rules: [
      {
        test: new RegExp('.(' + mediaFileExtensions.join('|') + ')$'),
        type: 'asset/resource',
        exclude: /node_modules/,
        generator: {
          filename: '[path]/[name][ext]',
        },
      },
      {
        test: /\.html$/,
        use: ['html-loader'],
        exclude: /node_modules/,
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
              flags: 'g',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
    }),
    new webpack.DefinePlugin({
      'process.env.LOG_LEVEL': JSON.stringify(env.LOG_LEVEL),
    }),
    // clean the build folder
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: ['build'],
    }),
    new CopyWebpackPlugin({
      patterns: [
        // copy static files that are not already automatically copied by being imported in the js files
        {
          from: extensionSrcPath + '/img',
          to: 'img',
        },
        // we don't need to copy fonts over bc they are copied via webpack
        // resolving the font.css and the font files from popup.js
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(extensionSrcPath, 'popup.html'),
      filename: extensionOutPath + '/popup.html',
      chunks: ['popup'],
    }),
    new HtmlWebpackPlugin({
      template: path.join(extensionSrcPath, 'options.html'),
      filename: extensionOutPath + '/options.html',
      chunks: ['options'],
    }),
    new WriteFilePlugin(),
    // don't inline css in html...
    new MiniCssExtractPlugin(),
  ],
};

const extensionConfig = {
  ...sharedConfig,
  context: extensionSrcPath,
  entry: {
    popup: path.join(extensionSrcPath, 'js', 'popup.js'),
    options: path.join(extensionSrcPath, 'js', 'options.js'),
    serviceWorker: path.join(extensionSrcPath, 'js', 'serviceWorker.js'),
    contentscript: path.join(extensionSrcPath, 'js', 'contentscript.js'),
  },
  output: {
    path: extensionOutPath,
    filename: '[name].js',
  },
  plugins: [
    ...sharedConfig.plugins,
    // copy static files that aren't imported anywhere, i.e
    // they're e.g. inserted in to the web pages by the extension (see manifest.json)
    // so they need to be manually copied over to the build folder
    new CopyWebpackPlugin({
      patterns: [
        {
          from: extensionSrcPath + '/manifest.json',
          // to: 'manifest.json',
          // this doesn't work?
          // transform: function (content) {
          //   // generates the manifest file using the package.json information
          //   return Buffer.from(
          //     JSON.stringify({
          //       description: process.env.npm_package_description,
          //       version: process.env.npm_package_version,
          //       ...JSON.parse(content.toString()),
          //     }),
          //   );
          // },
        },
        {
          from: extensionSrcPath + '/css/contentscript.css',
        },
        {
          from: extensionSrcPath + '/css/fonts.css',
        },
        {
          // needed by the manifest.json
          from: extensionSrcPath + '/_locales',
          to: '_locales',
        },
      ],
    }),
  ],
};

export const websiteConfig = {
  ...sharedConfig,
  context: websiteSrcPath,
  entry: {
    index: path.join(websiteSrcPath, 'js', 'index.js'),
  },
  output: {
    path: websiteOutPath,
    filename: '[name]-[hash].js',
  },
};

// deep log this
// console.dir(extensionConfig, { depth: null });
// console.log(websiteConfig);

if (env.IS_DEV) {
  sharedConfig.devtool = 'eval-cheap-module-source-map';
} else {
  sharedConfig.devtool = false;
}

// export default [extensionConfig, websiteConfig];
export default extensionConfig;
