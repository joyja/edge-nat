const os = require('os')
var { exec, spawn } = require('child_process')

const getInterfaces = async function () {
  return new Promise((resolve, reject) => {
    exec('ip route', (err, stdout, stderr) => {
      const defaultRoutes = stdout
        .split('\n')
        .filter(String)
        .filter((line) => line.includes('default'))
        .map(function (line) {
          // packets, bytes, target, pro, opt, in, out, src, dst, opts
          const raw = line.trim()
          const fields = raw.split(/\s+/)
          const metricIndex = fields.findIndex((field) =>
            field.includes('metric')
          )
          return {
            gateway: fields[2],
            interface: fields[4],
            metric:
              metricIndex !== -1
                ? fields[
                    fields.findIndex((field) => field.includes('metric')) + 1
                  ]
                : null,
          }
        })
      ifaces = os.networkInterfaces()
      Object.keys(ifaces).forEach((key) => {
        const defaultRoute = defaultRoutes.find(
          (route) => route.interface === key
        )
        ifaces[key] = {
          interfaces: ifaces[key],
          gateway4: defaultRoute ? defaultRoute.gateway : null,
        }
      })
      resolve(ifaces)
    })
  })
}

const blah = async function () {
  console.log(await getInterfaces())
}

blah()

module.exports = {
  getInterfaces,
}
