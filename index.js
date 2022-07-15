// bundlers can't detect that this is used in primus
// as it is a non-static require
const ws = require('ws')
const jsonParser = require('primus/parsers/json')
const wsTransformer = require('primus/transformers/websockets')
const core = require('@actions/core');
const Primus = require('primus')
const Emitter = require('primus-emitter')
const Socket = Primus.createSocket({
  transformer: wsTransformer,
  parser: jsonParser,
  plugin: { emitter: Emitter },
  noop: [ws]
})

const admiralHost = process.env.ADMIRAL_HOST
const appId = process.env.APP_ID
const order = process.env.ORDER
const version = process.env.VERSION
const explicitEnvironment = process.env.ENVIRONMENT

core.info('INPUT: ' + JSON.stringify({appId, order, version, explicitEnvironment}))

if (!admiralHost || !appId || !order || !version) {
  core.setFailed('admiralHost, appId, order and version must all be set')
  core.setOutput('success', 'false')
  process.exit(1)
}

const environment =
  explicitEnvironment || (version.includes('-') ? 'staging' : 'production')

core.info('Chosen Environment: ' + environment)

const client = new Socket(admiralHost, { strategy: false })

// We need to let Node know that we're doing something long lived
// You will need to set a timeout on the action or this risks using
// all your minutes!
setInterval(() => {
  client.send('ping')
}, 5000)

client.on('error', (error) => {
  core.setFailed('Client error: '+ error)
  core.setOutput('success', 'false')
  client.end()
  process.exit(1)
})

client.on('end', () => {
  core.info('Client disconnected')
  process.exit(1)
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
      }
      client.end()
    })
  })
})
