const koaBody = require('koa-body')
const koaLogger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const Framework = require('@galenjs/framework')
const compose = require('koa-compose')

const config = require('./config')

const bootstrap = async () => {
  const framework = new Framework(config)
  await framework.init()
  framework.app.use(compose([
    koaLogger(),
    koaBody({}),
    bodyParser()
  ]))
  await framework.loadMiddleware()
  await framework.start()
}

bootstrap()
