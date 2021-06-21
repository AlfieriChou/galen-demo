const os = require('os')

module.exports = () => {
  return async (ctx, next) => {
    const start = Date.now()
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
  }
}
