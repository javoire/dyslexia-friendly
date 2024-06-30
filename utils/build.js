import webpack from 'webpack';
import { options } from '../webpack.config.js';

delete options.chromeExtensionBoilerplate;

webpack(options, function(err) {
  if (err) throw err;
});
