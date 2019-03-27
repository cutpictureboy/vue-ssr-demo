const express = require('express')
const app = express()

const handleRequest = process.env.NODE_ENV === 'production' ? require('./prod.ssr') : require('./dev.ssr')

app.get('*', handleRequest)

app.listen(3000, () => {
  console.log(`server started at localhost:3000`)
})
