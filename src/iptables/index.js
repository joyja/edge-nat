var { exec, spawn } = require('child_process')

const getRules = async function () {
  return new Promise((resolve, reject) => {
    exec(
      'sudo iptables -t nat -L PREROUTING -n -v --line-numbers',
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

            const fields = raw.split(/\s+/, 9)

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

    // const lazy = new Lazy(iptablesExec.stdout)
    //   .lines
    //   .map(String)
    //   .skip(2) // skips the two lines that are iptables header
    //   .map(function (line) {
    //       // packets, bytes, target, pro, opt, in, out, src, dst, opts
    //       var fields = line.trim().split(/\s+/, 9);
    //       return {
    //         packets : fields[0],
    //         bytes : fields[1],
    //         target : fields[2],
    //         protocol : fields[3],
    //         opt : fields[4],
    //         in : fields[5],
    //         out : fields[6],
    //         src : fields[7],
    //         dst : fields[8],
    //         raw : line.trim()
    //       }
    //   })
    //   .join((result) => {
    //     resolve(result)
    //   })
  })
}

module.exports = {
  getRules,
}
