const path = require('path')

function getClientWebpackConfig () {
  process.env.WEBPACK_TARGET = undefined
  clearCache()
  let Service = require('@vue/cli-service/lib/Service')
  let service = new Service(process.env.VUE_CLI_CONTEXT || process.cwd())
  service.init(process.env.VUE_CLI_MODE || process.env.NODE_ENV)
  return service.resolveWebpackConfig()
}

function getServerWebpackConfig () {
  process.env.WEBPACK_TARGET = 'node'
  clearCache()
  let Service = require('@vue/cli-service/lib/Service')
  let service = new Service(process.env.VUE_CLI_CONTEXT || process.cwd())
  service.init(process.env.VUE_CLI_MODE || process.env.NODE_ENV)
  return service.resolveWebpackConfig()
}

function clearCache () {
  const modName = path.resolve(process.cwd(), 'vue.config.js')
  let mod = require.resolve(modName)
  if (mod && (mod = require.cache[mod]) !== undefined) {
    (function traverse (mod) {
      // 检查该模块的子模块并遍历它们
      mod.children.forEach(function (child) {
        traverse(child)
      })

      // 调用指定的callback方法，并将缓存的module当做参数传入
      delete require.cache[mod.id]
    }(mod))
  }
}
module.exports = {
  getClientWebpackConfig,
  getServerWebpackConfig
}
