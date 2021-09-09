#! /usr/bin/env sh
cp test/index.html src/index.html
sed -i -e 's/<script src="build\/index.js"><\/script>/<script src="dist\/index.js"><\/script>/g' src/index.html
rm -f src/index.html-e
