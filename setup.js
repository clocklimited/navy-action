const { execSync } = require('child_process')

console.log({__filename, __dirname})
execSync('npm install --omit=dev', { cwd: __dirname })
