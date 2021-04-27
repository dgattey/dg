// Reads TS config automatically and use the ts version of the config
const { generateConfig } = require('gatsby-plugin-ts-config')
module.exports = generateConfig({
	configDir: 'config',
})
