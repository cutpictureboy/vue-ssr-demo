const fs = require('fs')
const path = require('path')
const { createBundleRenderer } = require('vue-server-renderer')
const serverBundle = require('../dist/vue-ssr-server-bundle.json')
const clientManifest = require('../dist/vue-ssr-client-manifest.json')

const template = fs.readFileSync(path.resolve(__dirname, '../dist/index.template.html'), 'utf-8')

const renderer = createBundleRenderer(serverBundle, {
  runInNewContext: false,
  template,
  clientManifest
})

function renderToString (context) {
  return new Promise((resolve, reject) => {
    renderer.renderToString(context, (err, html) => {
      err ? reject(err) : resolve(html)
    })
  })
}

const handleRequest = async (req, res) => {
  const url = req.path
  if (/\w+.[js|css|jpg|jpeg|png|gif|map]/.test(url)) {
    await res.sendFile(url, { root: path.resolve(__dirname, '../dist') })
    return
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

module.exports = handleRequest
