import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import { options } from '../webpack.config.js';
import env from './env.js';

const extOptions = options.chromeExtensionBoilerplate || {};
const excludeEntriesToHotReload = extOptions.notHotReload || [];

for (let entryName in options.entry) {
  if (excludeEntriesToHotReload.indexOf(entryName) === -1) {
    options.entry[entryName] = [
      'webpack-dev-server/client?http://localhost:' + env.PORT,
      'webpack/hot/dev-server'
    ].concat(options.entry[entryName]);
  }
}

options.plugins = [new webpack.HotModuleReplacementPlugin()].concat(
  options.plugins || []
);

delete options.chromeExtensionBoilerplate;

const compiler = webpack(options);

const server = new WebpackDevServer(compiler, {
  hot: true,
  headers: { 'Access-Control-Allow-Origin': '*' }
});

server.listen(env.PORT);
