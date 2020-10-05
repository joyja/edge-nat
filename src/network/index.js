const ip = require('./ip')
const netplan = require('./netplan')

module.exports = {
  ...ip,
  ...netplan,
}
