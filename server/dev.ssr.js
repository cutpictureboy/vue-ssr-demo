const path = require('path')
const fs = require('fs')
const MemoryFs = require('memory-fs')
const webpack = require('webpack')
const { createBundleRenderer } = require('vue-server-renderer')

const serverWebpackConfig = require('./util').getServerWebpackConfig()
const clientWebpackConfig = require('./util').getClientWebpackConfig()

let serverBundle = ''
let clientManifest = ''
let template = fs.readFileSync(path.resolve(__dirname, '../public/index.template.html'), 'utf-8')

let renderer
let clientFs
let ready = false
setupDevServer().then((middleware) => {
  ready = true
  clientFs = middleware
})

const handleRequest = async (req, res) => {
  if (!clientFs || !ready) {
    res.status(404).end()
    return
  }
  const url = req.path

  if (/\w+.[js|css|jpg|jpeg|png|gif|map|json]/.test(url)) {
    console.log(`proxy ${url}`)
    try {
      clientFs.createReadStream(path.join(clientWebpackConfig.output.path, url)).pipe(res)
    } catch (err) {
      res.status(404).end()
    }
    return
  }

  const renderToString = (context) => {
    return new Promise((resolve, reject) => {
      renderer.renderToString(context, (err, html) => {
        err ? reject(err) : resolve(html)
      })
    })
  }

  const context = { url }

  res.setHeader('Content-Type', 'text/html;charset=UTF-8')
  let html = ''
  try {
    html = await renderToString(context)
  } catch (err) {
    if (err.code === 404) {
      res.status(404)
      html = 'Page not found'
    } else {
      res.status(500)
      html = 'Internal Server Error'
    }
  } finally {
    res.end(html)
  }
}

function setupDevServer () {
  return new Promise((resolve, reject) => {
    ready = false

    const serverFs = new MemoryFs()
    const serverCompile = webpack(serverWebpackConfig)
    const clientFs = new MemoryFs()
    const clientCompile = webpack(clientWebpackConfig)
    serverCompile.outputFileSystem = serverFs
    clientCompile.outputFileSystem = clientFs

    serverCompile.watch({}, (err, stats) => {
      if (err) {
        throw err
      }
      stats = stats.toJson()
      stats.errors.forEach(error => console.error(error))
      stats.warnings.forEach(warn => console.warn(warn))

      serverBundle = JSON.parse(readFile(serverFs, 'vue-ssr-server-bundle.json', serverWebpackConfig))
      update()
    })
    clientCompile.run()
    clientCompile.hooks.done.tap('VueClientPluginDone', (stats) => {
      stats = stats.toJson()
      stats.errors.forEach(err => console.error(err))
      stats.warnings.forEach(err => console.warn(err))
      try {
        clientManifest = JSON.parse(readFile(clientFs, 'vue-ssr-client-manifest.json', clientWebpackConfig))
        resolve(clientFs)
      } catch (err) {
        console.log(err)
      }
      update()
    })
  })
}

function update () {
  renderer = createBundleRenderer(serverBundle, {
    runInNewContext: false,
    template,
    clientManifest
  })
}

function readFile (fs, file, config) {
  try {
    return fs.readFileSync(path.join(config.output.path, file), 'utf-8')
  } catch (e) {}
}

module.exports = handleRequest
