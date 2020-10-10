const { exec, spawn } = require('child_process')
const differenceInSeconds = require('date-fns/differenceInSeconds')
const pcap = require('pcap')
const pcap_session = pcap.createSession('eth1', 'tcp')

const onAt = new Date()
let packetCount = 0
let uptime = 0
let capture = true

console.log('Listening on ' + pcap_session.device_name)

pcap_session.on('packet', function (raw_packet) {
  const packet = pcap.decode.packet(raw_packet)
  if (capture) {
    console.log(packet.payload.payload)
    capture = false
  }
})

setInterval(() => {
  uptime = differenceInSeconds(new Date(), onAt)
  console.log(pcap_session.stats())
  console.log(
    parseFloat(uptime > 0 ? pcap_session.stats().ps_recv / uptime : 0).toFixed(
      1
    )
  )
}, 5000)

const getInterfaces = async function () {
  return new Promise((resolve, reject) => {
    exec('ip addr show', (err, stdout, stderr) => {
      const interfaces = stdout
        .split('\n') //split into members by newline
        .filter(String) //Only get valid strings
        .filter((line) => !line.startsWith(' ')) //Filter out the detail lines (they have leading spaces)
        .filter((line) => !line.includes('lo:')) //Filter out the loopback interface
        .map((line) => {
          const raw = line.trim()
          const fields = raw.split(/\s+/, 10)
          return {
            id: fields[0].replace(':', ''),
            name: fields[1].split('@')[0],
            mtu: fields[4],
            state: fields[8],
          }
        })
      console.log(interfaces)
    })
  })
}

// getInterfaces()
