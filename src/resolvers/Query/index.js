const iptables = require('../../iptables')
const network = require('../../network')

const iptablesRules = async function (root, args, context, info) {
  return iptables.getRules()
}

const networkInterfaces = async function (root, args, context, info) {
  return network.getInterfaces()
}

const networkInterfaceConfigs = async function (root, args, context, info) {
  const config = network.getConfig()[0]
  const result = Object.keys(config.contents.network.ethernets).map((key) => {
    return {
      name: key,
      ...config.contents.network.ethernets[key],
    }
  })
  return result
}

module.exports = {
  info: () => `This is an Edge NAT appliance based on iptables.`,
  iptablesRules,
  networkInterfaces,
  networkInterfaceConfigs,
}
