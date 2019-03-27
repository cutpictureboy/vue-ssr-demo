const webpackServerConfig = require('./build/webpack.server')
const webpackClientConfig = require('./build/webpack.client')

module.exports = process.env.WEBPACK_TARGET === 'node' ? webpackServerConfig : webpackClientConfig
