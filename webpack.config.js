import webpack from 'webpack';
import fs from 'fs';
import path from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import WriteFilePlugin from 'write-file-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import WebpackStringReplacer from 'webpack-string-replacer';

import env from './utils/env.js';
import postcssScopeSite from './utils/postcss-scope-site.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sharedSrcPath = path.join(__dirname, 'src/shared');

// The popup configForm markup, shared verbatim by the extension popup and the
// marketing-site live demo (RAN-176). Injected into both templates via
// HtmlWebpackPlugin's `templateParameters` so neither page duplicates it.
const configFormHtml = fs.readFileSync(
  path.join(sharedSrcPath, 'html/configForm.html'),
  'utf8',
);
const extensionSrcPath = path.join(__dirname, 'src/extension');
const extensionOutPath = path.join(__dirname, 'build/extension');
const websiteSrcPath = path.join(__dirname, 'src/website');
const websiteOutPath = path.join(__dirname, 'build/website');

const sharedConfig = {
  stats: 'errors-warn',
  name: 'extension',
  mode: env.NODE_ENV,
  devServer: {
    devMiddleware: {
      writeToDisk: true,
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              noEmit: false,
            },
          },
        },
        exclude: /node_modules/,
      },
      {
        test: new RegExp('/fonts/'),
        type: 'asset/resource',
        exclude: /node_modules/,
        generator: {
          filename: './fonts/[name][ext]',
        },
      },
      {
        // Don't run html-loader on the HtmlWebpackPlugin entry templates:
        // they must reach the plugin's built-in lodash compiler so the
        // `<%= configFormHtml %>` shared-partial injection (RAN-176) and
        // `templateParameters` are evaluated. html-loader would otherwise turn
        // the template into a module and emit the interpolation verbatim.
        test: /\.html$/,
        use: ['html-loader'],
        exclude: [/node_modules/, /popup\.html$/, /index\.html$/],
      },
      {
        // Site-scoped import of contentscript.css (RAN-176): re-scope every
        // `body`/`html`/`#dyslexia-friendly-ruler` selector to `#site-root`
        // via the postcss-scope-site plugin so the whole marketing page (which
        // lives inside #site-root) reacts to the popup, while reusing
        // contentscript.css verbatim (single source of truth, no synced copy).
        test: /\.css$/,
        resourceQuery: /site/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [postcssScopeSite()],
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        resourceQuery: { not: [/site/] },
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
    }),
    new webpack.DefinePlugin({
      'process.env.LOG_LEVEL': JSON.stringify(env.LOG_LEVEL),
    }),
    new CopyWebpackPlugin({
      patterns: [
        // copy static files that are not already automatically copied by being imported in the js files
        {
          from: sharedSrcPath + '/img',
          to: 'img',
        },
        // we don't need to copy fonts over bc they are copied via webpack
        // resolving the font.css and the font files from e.g. popup.js
      ],
    }),
    new WriteFilePlugin(),
    // don't inline css in html...
    new MiniCssExtractPlugin(),
  ],
};

const extensionConfig = {
  ...sharedConfig,
  context: extensionSrcPath,
  devServer: {
    devMiddleware: {
      index: 'popup.html',
    },
    port: 3001,
  },
  // Override devtool for extension to never use eval as service worker will complain
  devtool: false,
  optimization: {
    // Ensure no eval is used in extension builds
    concatenateModules: false,
    minimize: env.NODE_ENV === 'production',
  },
  entry: {
    popup: path.join(extensionSrcPath, 'js', 'popup.ts'),
    about: path.join(extensionSrcPath, 'js', 'about.ts'),
    options: path.join(extensionSrcPath, 'js', 'options.ts'),
    serviceWorker: path.join(extensionSrcPath, 'js', 'serviceWorker.ts'),
    contentscript: path.join(extensionSrcPath, 'js', 'contentscript.ts'),
  },
  output: {
    path: extensionOutPath,
    filename: '[name].js',
  },
  plugins: [
    ...sharedConfig.plugins,
    new WebpackStringReplacer({
      rules: [
        {
          // this stage name triggers a deprecated warning in webpack, but it works
          applyStage: 'optimizeChunkAssets',
          outputFileInclude: 'contentscript.css',
          replacements: [
            {
              pattern: './fonts',
              // contentscripts need to load fonts from the extension protocol
              replacement: 'chrome-extension://__MSG_@@extension_id__/fonts',
            },
          ],
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(extensionSrcPath, 'popup.html'),
      filename: extensionOutPath + '/popup.html',
      chunks: ['popup'],
      templateParameters: { configFormHtml },
    }),
    new HtmlWebpackPlugin({
      template: path.join(extensionSrcPath, 'about.html'),
      filename: extensionOutPath + '/about.html',
      chunks: ['about'],
    }),
    new HtmlWebpackPlugin({
      template: path.join(extensionSrcPath, 'options.html'),
      filename: extensionOutPath + '/options.html',
      chunks: ['options'],
    }),
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: ['extension'],
    }),
    // copy static files that aren't imported anywhere
    new CopyWebpackPlugin({
      patterns: [
        {
          from: extensionSrcPath + '/manifest.json',
          // TODO: use package.json version and copy it to manifest.json?
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

const websiteConfig = {
  ...sharedConfig,
  name: 'website',
  devServer: {
    ...sharedConfig.devServer,
    port: 3000,
  },
  context: websiteSrcPath,
  plugins: [
    ...sharedConfig.plugins,
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: ['website'],
    }),
    // Website images aren't imported anywhere (referenced via static src in
    // index.html), so copy them into the build. Without this the mobile popup
    // fallback (popup.png) 404s on narrow viewports (RAN-176).
    new CopyWebpackPlugin({
      patterns: [
        {
          from: websiteSrcPath + '/img',
          to: 'img',
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(websiteSrcPath, 'index.html'),
      filename: websiteOutPath + '/index.html',
      chunks: ['index'],
      templateParameters: { configFormHtml },
    }),
    new HtmlWebpackPlugin({
      template: path.join(websiteSrcPath, 'privacy-policy.html'),
      filename: websiteOutPath + '/privacy-policy.html',
      chunks: ['index'],
    }),
  ],
  entry: {
    index: path.join(websiteSrcPath, 'js', 'index.ts'),
  },
  output: {
    path: websiteOutPath,
    filename: '[name]-[chunkhash].js',
  },
};

if (env.IS_DEV) {
  sharedConfig.devtool = 'cheap-module-source-map';
} else {
  sharedConfig.devtool = false;
}

export default [extensionConfig, websiteConfig];
