const core = require('@actions/core');
const Primus = require('primus')
const Emitter = require('primus-emitter')
const Socket = Primus.createSocket({
  transformer: 'websockets',
  parser: 'JSON',
  plugin: { emitter: Emitter }
})

const admiralHost = core.getInput('admiralHost')
const appId = core.getInput('appId')
const order = core.getInput('order')
const version = core.getInput('version')
const explicitEnvironment = core.getInput('environment')

core.info('INPUT:', appId, order, version, explicitEnvironment)

if (!admiralHost || !appId || !order || !version) {
  core.setFailed('admiralHost, appId, order and version must all be set')
  process.exit(1)
}

const environment =
  explicitEnvironment || (version.includes('-') ? 'staging' : 'production')

core.info('Chosen Environment:', environment)

const client = new Socket(admiralHost, { strategy: false })

client.on('error', (error) => {
  core.info(error)
  client.end()
})

client.on('open', () => {
  client.on('serverMessage', (data) => {
    const msg = 'Admiral: ' + data.message
    core.info(msg)
  })

  client.on('captainMessage', (data) => {
    const msg = data.captainName + ': ' + data.message
    core.info(msg)
  })

  client.send('register', null, (response) => {
    const data = {
      appId: appId,
      environment: environment,
      order: order,
      orderArgs: [version],
      clientId: response.clientId,
      username: 'GitHub Actions'
    }
    client.send('executeOrder', data, (response) => {
      if (response.success) {
        core.info('ORDER EXECUTED')
        core.setOutput('success', true)
      } else {
        if (response.message) core.info(response.message)
        core.setOutput('success', false)
        core.setFailed(response.message)
        process.exit(1)
      }
      client.end()
    })
  })
})
