const iptablesUpdate = {
  subscribe: (root, args, context) => {
    return context.pubsub.asyncIterator(`iptablesUpdate`)
  },
}

module.exports = {
  iptablesUpdate,
}
