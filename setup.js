const { execSync } = require('child_process')

execSync('npm install --omit=dev --ignore-scripts', { cwd: __dirname })
