const { exec, spawn } = require('child_process')
const isCidr = require('is-cidr')
const isIp = require('is-ip')
const { isIPv4 } = require('net')

const getLines = async function (chain) {
  return new Promise((resolve, reject) => {
    exec(
      `sudo iptables -t nat -L ${chain} -n -v --line-numbers`,
      (err, stdout, stderr) => {
        const lines = stdout
          .split('\n')
          .slice(2, stdout.split('\n').length)
          .filter(String)
          .map(function (line) {
            // packets, bytes, target, pro, opt, in, out, src, dst, opts
            const raw = line.trim()

            let dpt = raw.substring(raw.lastIndexOf('dpt:'), raw.length)
            dpt = dpt.substring(0, dpt.indexOf(' ')).replace('dpt:', '')

            let to = raw
              .substring(raw.lastIndexOf('to:'), raw.length)
              .replace('to:', '')

            const fields = raw.split(/\s+/, 10)

            return {
              line: fields[0],
              packets: fields[1],
              bytes: fields[2],
              target: fields[3],
              protocol: fields[4],
              opt: fields[5],
              in: fields[6],
              out: fields[7],
              src: fields[8],
              dst: fields[9],
              dpt,
              comment: raw
                .substring(raw.lastIndexOf('/*') + 2, raw.lastIndexOf('*/'))
                .trim(),
              to,
              raw,
            }
          })
        resolve(lines)
      }
    )
  })
}

const getRules = async function () {
  const dnat = await getLines('PREROUTING')
  const snat = await getLines('POSTROUTING')
  return dnat.map((dLine) => {
    const sLine = snat.find((sLine) => {
      return sLine.dst === dLine.to
    })
    return {
      dnatLine: dLine.line,
      snatLine: sLine ? sLine.line : null,
      incomingDestAddress: dLine.dst,
      outgoingDestAddress: dLine.to,
      outgoingSourceAddress: sLine ? sLine.to : null,
    }
  })
}

const createRule = async function ({
  incomingDestAddress,
  outgoingSourceAddress,
  outgoingDestAddress,
}) {
  if (!isIPv4(incomingDestAddress)) {
    throw new Error(
      `The incoming source address ${incomingDestAddress} is not a valid IP Address.`
    )
  }
  if (!isIPv4(outgoingDestAddress)) {
    throw new Error(
      `The outgoing destination address ${outgoingDestAddress} is not a valid IP Address.`
    )
  }
  await new Promise((resolve, reject) => {
    exec(
      `sudo iptables -t nat -A PREROUTING -d ${incomingDestAddress} -j DNAT --to-destination ${outgoingDestAddress}`,
      () => {
        resolve()
      }
    )
  })
  if (outgoingSourceAddress) {
    if (!isIPv4(outgoingSourceAddress)) {
      throw new Error(
        `There is an outgoing source address ${outgoingSourceAddress}, but it not a valid IP Address.`
      )
    }
    await new Promise((resolve, reject) => {
      exec(
        `sudo iptables -t nat -A POSTROUTING -d ${outgoingDestAddress} -j SNAT --to-source ${outgoingSourceAddress}`,
        () => {
          resolve()
        }
      )
    })
  }
  const rules = await getRules()
  return rules.find((rule) => {
    return (
      rule.incomingDestAddress === incomingDestAddress &&
      rule.outgoingSourceAddress === outgoingSourceAddress &&
      rule.outgoingDestAddress === outgoingDestAddress
    )
  })
}

deleteRule = async function ({ dnatLine, snatLine }) {
  const oldRules = await getRules()
  const deletedRule = oldRules.find((rule) => {
    if (snatLine) {
      return rule.snatLine === snatLine && rule.dnatLine === dnatLine
    } else {
      return rule.dnatLine === dnatLine
    }
  })
  await new Promise((resolve, reject) => {
    exec(`sudo iptables -t nat -D PREROUTING ${dnatLine}`, () => {
      resolve()
    })
  })
  if (snatLine) {
    await new Promise((resolve, reject) => {
      exec(`sudo iptables -t nat -D POSTROUTING ${snatLine}`, () => {
        resolve()
      })
    })
  }
  return deletedRule
}

module.exports = {
  getRules,
  createRule,
  deleteRule,
}
