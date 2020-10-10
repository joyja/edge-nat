const iptables = require('./iptables')

// iptables.createRule({
//   incomingSourceAddress: '10.155.20.124',
//   outgoingSourceAddress: '10.162.241.209',
//   outgoingDestAddress: '10.162.241.50',
// })

const floop = async function () {
  console.log(await iptables.getRules())
}

floop()
