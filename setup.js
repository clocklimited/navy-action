const { execSync } = require('child_process')

execSync('npm install --omit=dev', { cwd: __filename })
