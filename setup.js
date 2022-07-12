const { execSync } = require('child_process')

execSync('npm install --production', { cwd: __filename })
