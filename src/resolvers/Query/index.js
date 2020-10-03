const iptables = require('../../iptables')

const iptablesRules = async function (root, args, context, info) {
  const result = await iptables.getRules()
  return result
}

module.exports = {
  info: () => `This is an Edge NAT appliance based on iptables.`,
  iptablesRules,
}
