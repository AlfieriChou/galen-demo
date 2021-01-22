const Koa = require('koa')
const koaBody = require('koa-body')
const koaLogger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const os = require('os')
const path = require('path')
const fs = require('fs')

const loadModels = require('@galenjs/base')
const loadSequelizeModels = require('@galenjs/sequelize-models')
const createInfluxClient = require('@galenjs/influx')
// const buildSwaggerDocs = require('@galenjs/swagger')
const createRedisClient = require('@galenjs/redis')
const buildRouter = require('@galenjs/router')
const classLoader = require('@galenjs/class-loader')

const config = require('./config')

const app = new Koa()
let pendingCount = 0

const exitTimeout = 60 * 1000

const gracefulExit = async (server, cleanUp, logger = console) => {
  const close = () => {
    logger.info('on SIGTERM wait requests')
    server.close(async () => {
      logger.info('wait cleanUp')
      await cleanUp()
      logger.info('done cleanUp')
      process.exit(0)
    })
    setTimeout(() => {
      logger.error('force exit')
      process.exit(0)
    }, exitTimeout)
  }
  process.on('SIGINT', close)
  process.on('SIGTERM', close)
}

const bootstrap = async () => {
  const { remoteMethods, modelSchemas, schemas } = await loadModels({
    workspace: process.cwd(),
    modelPath: 'app/models'
  })

  app.context.remoteMethods = remoteMethods
  app.context.modelSchemas = modelSchemas
  app.context.schemas = schemas
  app.context.models = await loadSequelizeModels(modelSchemas, config.mysql)
  app.context.influx = await createInfluxClient(modelSchemas, config.influx)
  app.context.redis = await createRedisClient(config.redis)
  const controllerPath = path.resolve(__dirname, './app/controller')
  const servicePath = path.resolve(__dirname, './app/service')
  app.context.controller = fs.existsSync(controllerPath) ? classLoader(controllerPath) : {}
  app.context.service = fs.existsSync(servicePath) ? classLoader(servicePath) : {}

  const router = await buildRouter({ remoteMethods, modelSchemas })
  app.use(async (ctx, next) => {
    const start = Date.now()
    pendingCount += 1
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
      pendingCount -= 1
      if (pendingCount === 0) {
        ctx.app.emit('pendingCount0')
      }
    }
  })

  app.use(koaLogger())
  app.use(koaBody({}))
  app.use(bodyParser())
  app.use(router.routes())
  app.use(router.allowedMethods())

  const server = app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`✅  The server is running at http://localhost:${config.port}`)
  })

  gracefulExit(server, () => new Promise((resolve) => {
    if (app.context.models) {
      app.context.models.quit()
    }
    if (app.context.redis) {
      app.context.redis.quit()
    }
    if (pendingCount === 0) {
      resolve()
    } else {
      app.on('pendingCount0', resolve)
    }
  }))
}

bootstrap()

// const openApi = await buildSwaggerDocs({
//   title: 'galen API document',
//   version: 'v3',
//   description: 'Galen document'
// }, { schemas, remoteMethods })
