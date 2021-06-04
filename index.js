const koaBody = require('koa-body')
const koaLogger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const os = require('os')
const Framework = require('@galenjs/framework')

const config = require('./config')

const bootstrap = async () => {
  const framework = new Framework(config)
  await framework.init()

  framework.app.use(async (ctx, next) => {
    const start = Date.now()
    ctx.set('Access-Control-Allow-Origin', ctx.request.header.origin)
    ctx.set('Access-Control-Allow-Credentials', true)
    ctx.set('Access-Control-Max-Age', 86400000)
    ctx.set('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, POST, DELETE')
    ctx.set('Access-Control-Allow-Headers', 'x-requested-with, accept, origin, content-type')
    await next()
    await ctx.influx.writePoints([{
      measurement: 'response_time',
      tags: {
        host: os.hostname()
      },
      fields: {
        duration: Date.now() - start,
        path: ctx.path
      }
    }])
  })
  framework.app.use(...[koaLogger(), koaBody({}), bodyParser()])
  await framework.start()
}

bootstrap()
