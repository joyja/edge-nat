const { spawn } = require('child_process')

const deployUpdateStatus = {
  progress: null,
  lastUpdateAt: null,
  error: null,
}

const deployUpdate = async function (context) {
  return new Promise((resolve, reject) => {
    const backendChild = spawn(
      'pm2',
      ['deploy', 'ecosystem.config.js', 'production', 'update'],
      {
        cwd: '/root/edge-nat/',
      }
    )
    deployUpdateStatus.progress = 0
    deployUpdateStatus.error = null

    backendChild.stdout.on('data', (data) => {
      deployUpdateStatus.progress += 1
      context.pubsub.publish('deployUpdateStatus', {
        deployUpdateStatus: context.deployUpdateStatus,
      })
    })

    backendChild.stderr.on('data', (data) => {
      deployUpdateStatus.error = `${data}`
      context.pubsub.publish('deployUpdateStatus', {
        deployUpdateStatus: context.deployUpdateStatus,
      })
    })

    backendChild.on('error', (error) => {
      deployUpdateStatus.error = error
      context.pubsub.publish('deployUpdateStatus', {
        deployUpdateStatus: context.deployUpdateStatus,
      })
    })

    backendChild.on('close', (data) => {
      deployUpdateStatus.progress = 25
      deployUpdateStatus.lastUpdateAt = new Date()
      deployUpdateStatus.error = null
      context.pubsub.publish('deployUpdateStatus', {
        deployUpdateStatus: context.deployUpdateStatus,
      })
      new Promise((resolve, reject) => {
        const frontendChild = spawn(
          'pm2',
          ['deploy', 'ecosystem.config.js', 'production', 'update'],
          {
            cwd: '/root/edge-nat-ui/',
          }
        )
        frontendChild.stdout.on('data', (data) => {
          deployUpdateStatus.progress += 2
          context.pubsub.publish('deployUpdateStatus', {
            deployUpdateStatus: context.deployUpdateStatus,
          })
        })
        frontendChild.stderr.on('data', (data) => {
          deployUpdateStatus.error = `${data}`
          context.pubsub.publish('deployUpdateStatus', {
            deployUpdateStatus: context.deployUpdateStatus,
          })
        })
        frontendChild.on('error', (error) => {
          deployUpdateStatus.error = error
          context.pubsub.publish('deployUpdateStatus', {
            deployUpdateStatus: context.deployUpdateStatus,
          })
        })
        frontendChild.on('close', (data) => {
          deployUpdateStatus.progress = 100
          deployUpdateStatus.lastUpdateAt = new Date()
          deployUpdateStatus.error = null
          context.pubsub.publish('deployUpdateStatus', {
            deployUpdateStatus: context.deployUpdateStatus,
          })
        })
      })
    })

    resolve(deployUpdateStatus)
  })
}

module.exports = {
  deployUpdate,
  deployUpdateStatus,
}
