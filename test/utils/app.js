import bodyParser from 'body-parser'
import express from 'express'

export default function() {
  const app = express()
  app.use(bodyParser.json())
  app.use(bodyParser.json({type: 'application/vnd.api+json'}))
  return app
}
