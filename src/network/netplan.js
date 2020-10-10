const fs = require('fs')
const yaml = require('js-yaml')
const isCidr = require('is-cidr')
const isIp = require('is-ip')
const { exec } = require('child_process')

const getConfig = function () {
  const dirPath = '/etc/netplan/'
  return fs.readdirSync(dirPath).map((filePath) => {
    fileContents = fs.readFileSync(dirPath + filePath)
    return {
      path: filePath,
      contents: yaml.safeLoad(fileContents),
    }
  })
}

const setInterfaceConfig = function (updates) {
  if (updates) {
    const config = getConfig()[0]
    if (config.contents.network.ethernets[updates.name]) {
      const newConfig = {}
      newConfig.dhcp4 = !!updates.dhcp4
      if (!updates.dhcp4) {
        if (updates.addresses) {
          updates.addresses.forEach((address, index) => {
            if (!isCidr.v4(address)) {
              throw Error(
                `IP address with CIDR at index ${index}: ${address} is not valid.`
              )
            }
          })
          newConfig.addresses = updates.addresses
        }
        if (updates.gateway4) {
          if (isIp.v4(updates.gateway4)) {
            newConfig.gateway4 = updates.gateway4
          } else {
            throw Error(`Gateway must be a valid IPv4 address.`)
          }
        }
      }
      config.contents.network.ethernets[updates.name] = newConfig
      const yamlDump = yaml.safeDump(config.contents)
      fs.writeFileSync('/etc/netplan/' + config.path, yamlDump)
      exec('sudo netplan apply', (error, stdout, stderr) => {
        if (error) console.error(error)
        if (stderr) console.error(stderr)
      })
    } else {
      if (updates.name) {
        throw new Error(`Interface wth name ${updates.name} does not exist.`)
      } else {
        throw new Error(`Interface name must be specified.`)
      }
    }
  } else {
    throw new Error('Interface updates must be defined.')
  }
}

module.exports = {
  getConfig,
  setInterfaceConfig,
}
