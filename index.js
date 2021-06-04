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
const createRedisClient = require('@galenjs/redis')
const buildRouter = require('@galenjs/koa-router')
const classLoader = require('@galenjs/class-loader')

const config = require('./config')
const gracefulExit = require('./lib/gracefulExit')

const app = new Koa()
let pendingCount = 0

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

  gracefulExit(server, async () => {
    if (pendingCount === 0) {
      if (app.context.redis) {
        await app.context.redis.quit()
      }
      if (app.context.models) {
        await app.context.models.quit()
      }
    } else {
      app.on('pendingCount0', async () => {
        if (app.context.redis) {
          await app.context.redis.quit()
        }
        if (app.context.models) {
          await app.context.models.quit()
        }
      })
    }
  })
}

bootstrap()
