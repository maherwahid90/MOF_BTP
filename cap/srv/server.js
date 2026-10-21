const cds = require('@sap/cds')
const seed = require('./seed')

cds.once('served', seed)

module.exports = cds.server
