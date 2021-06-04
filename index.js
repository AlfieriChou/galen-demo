const koaBody = require('koa-body')
const koaLogger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const os = require('os')
const path = require('path')
const fs = require('fs')

const Framework = require('@galenjs/framework')
const createInfluxClient = require('@galenjs/influx')
const classLoader = require('@galenjs/class-loader')

const config = require('./config')

const bootstrap = async () => {
  const framework = new Framework(config)
  await framework.init()

  framework.app.context.influx = await createInfluxClient(framework.modelSchemas, config.influx)

  const controllerPath = path.resolve(__dirname, './app/controller')
  const servicePath = path.resolve(__dirname, './app/service')
  framework.app.context.controller = fs.existsSync(controllerPath)
    ? classLoader(controllerPath) : {}
  framework.app.context.service = fs.existsSync(servicePath) ? classLoader(servicePath) : {}

  framework.app.use(async (ctx, next) => {
    const start = Date.now()
    framework.pendingCount += 1
    if (ctx.request.method === 'OPTIONS') {
      ctx.response.status = 200
    }
    ctx.set('Access-Control-Allow-Origin', ctx.request.header.origin)
    ctx.set('Access-Control-Allow-Credentials', true)
    ctx.set('Access-Control-Max-Age', 86400000)
    ctx.set('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, POST, DELETE')
    ctx.set('Access-Control-Allow-Headers', 'x-requested-with, accept, origin, content-type')
    try {
      await next()
      const duration = Date.now() - start
      await ctx.influx.writePoints([{
        measurement: 'response_time',
        tags: { host: os.hostname() },
        fields: { duration, path: ctx.path }
      }])
    } catch (err) {
      // TODO: logger
      console.error('error: ', err)
      ctx.status = err.status || 500
      ctx.body = {
        code: ctx.status,
        message: err.message
      }
    } finally {
      framework.pendingCount -= 1
      if (framework.pendingCount === 0) {
        ctx.app.emit('pendingCount0')
      }
    }
  })

  framework.app.use(koaLogger())
  framework.app.use(koaBody({}))
  framework.app.use(bodyParser())
  await framework.loadRoutes()
  await framework.listen()
}

bootstrap()
