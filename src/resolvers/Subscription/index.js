const iptablesUpdate = {
  subscribe: (root, args, context) => {
    return context.pubsub.asyncIterator(`iptablesUpdate`)
  },
}

const deployUpdateStatus = {
  subscribe: (root, args, context) => {
    return context.pubsub.asyncIterator(`deployUpdateStatus`)
  },
}

module.exports = {
  iptablesUpdate,
  deployUpdateStatus,
}
