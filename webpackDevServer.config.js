'use strict';

const fs = require('fs');
const path = require('path');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

module.exports = () => {
  return {
    port: 3000,
    host: '0.0.0.0',
    hot: false,
    hotOnly: false,
    quiet: true,
    overlay: true,
    publicPath: resolveApp('build'),
    writeToDisk: true,
    watchOptions: {
      ignored: /node_modules/,
    },
    openPage: 'test',
    open: true,
    noInfo: true,
    clientLogLevel: 'silent',
    injectHot: false,
    stats: 'none',
    liveReload: false,
    noInfo: true
  };
};
