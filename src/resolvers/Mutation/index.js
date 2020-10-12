const { resolveConfig } = require('prettier')
const network = require('../../network')
const iptables = require('../../iptables')
const pm2 = require('../../pm2')

const createRule = async function (root, args, context, info) {
  return iptables.createRule(args)
}

const deleteRule = async function (root, args, context, info) {
  return iptables.deleteRule(args)
}

const setInterfaceConfig = async function (root, args, context, info) {
  const config = {
    name: args.name,
    dhcp4: args.dhcp,
    addresses: args.addresses,
    gateway4: args.gateway,
  }
  network.setInterfaceConfig(config)
  await new Promise((resolve) => setTimeout(() => resolve(), 2000))
  const ifaces = await network.getInterfaces()
  const defaultRoutes = await network.getDefaultRoutes()
  const iface = ifaces.find((iface) => iface.name === args.name)
  const defaultRoute = defaultRoutes.find(
    (route) => route.interface === iface.name
  )
  return {
    ...iface,
    gateway: defaultRoute ? defaultRoute.gateway : null,
  }
}

const deployUpdate = async function (root, args, context, info) {
  return pm2.deployUpdate(context)
}

module.exports = {
  createRule,
  deleteRule,
  setInterfaceConfig,
  deployUpdate,
}
