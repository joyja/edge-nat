const fs = require('fs')
const yaml = require('js-yaml')

const getConfig = function () {
  const dirPath = '/etc/netplan/'
  return fs.readdirSync(dirPath).map((filePath) => {
    fileContents = fs.readFileSync(dirPath + filePath)
    return {
      path: filePath,
      contents: yaml.safeLoad(fileContents),
    }
  })
}

module.exports = {
  getConfig,
}
