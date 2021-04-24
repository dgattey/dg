// Reads TS config automatically and use the ts version of the config
require('ts-node').register()
module.exports = require('./gatsby-config.ts')
