if [[ "$1" == "revert" ]]
then
  cp webpackDevServer.config.js.save node_modules/@blockly/dev-scripts/config/webpackDevServer.config.js
  cp start.js.save node_modules/@blockly/dev-scripts/scripts/start.js
  exit 0
fi
echo use $0 revert to revert changes
test -e webpackDevServer.config.js.save || cp node_modules/@blockly/dev-scripts/config/webpackDevServer.config.js webpackDevServer.config.js.save
test -e start.js.save || cp node_modules/@blockly/dev-scripts/scripts/start.js start.js.save

cp webpackDevServer.config.js node_modules/@blockly/dev-scripts/config/webpackDevServer.config.js
cp start.js node_modules/@blockly/dev-scripts/scripts/start.js
