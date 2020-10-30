const iptables = require('../../iptables')
const network = require('../../network')

const natRules = async function (root, args, context, info) {
  return iptables.getRules()
}

const networkInterfaces = async function (root, args, context, info) {
  const ifaces = await network.getInterfaces()
  const defaultRoutes = await network.getDefaultRoutes()
  return ifaces.map((iface) => {
    const defaultRoute = defaultRoutes.find(
      (route) => route.interface === iface.name
    )
    return {
      ...iface,
      gateway: defaultRoute ? defaultRoute.gateway : null,
    }
  })
}

const networkInterfaceConfigs = async function (root, args, context, info) {
  const config = network.getConfig()[0]
  console.log(config.contents.network.ethernets)
  const result = Object.keys(config.contents.network.ethernets).map((key) => {
    return {
      name: key,
      ...config.contents.network.ethernets[key],
      addresses: config.contents.network.ethernets[key].addresses || [],
    }
  })
  return result
}

module.exports = {
  info: () => `This is an Edge NAT appliance based on iptables.`,
  natRules,
  networkInterfaces,
  networkInterfaceConfigs,
}
