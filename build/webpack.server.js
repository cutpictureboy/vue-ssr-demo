const VueServerPlugin = require('vue-server-renderer/server-plugin')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  configureWebpack: () => ({
    entry: './src/entry-server',
    target: 'node',
    plugins: [
      new VueServerPlugin()],
    externals: nodeExternals({
      whitelist: /.\css$/
    }),
    output: {
      libraryTarget: 'commonjs2'
    }
  })
}
