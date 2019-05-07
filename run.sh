#!/bin/bash
set -euo pipefail

NODE_ENV=development ./node_modules/.bin/watchify -vd -p browserify-hmr index.js -o bundle.js &
./node_modules/.bin/http-server -c 1 -a localhost &
wait