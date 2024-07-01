import webpack from 'webpack';
import { extensionConfig, websiteConfig } from '../webpack.config.js';

webpack(extensionConfig, function (err) {
  if (err) {
    console.log(err);
    throw err;
  }
});

// webpack(websiteConfig, function (err) {
//   if (err) {
//     console.log(err);
//     // throw err;
//   }
// });
