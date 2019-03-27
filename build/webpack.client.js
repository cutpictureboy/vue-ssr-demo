const VueClientPlugin = require('vue-server-renderer/client-plugin')

module.exports = {
  configureWebpack: () => ({
    entry: `./src/entry-client`,
    plugins: [new VueClientPlugin()]
  })
}
