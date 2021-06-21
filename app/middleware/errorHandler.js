module.exports = () => {
  return async (ctx, next) => {
    ctx.app.pendingCount += 1
    if (ctx.request.method === 'OPTIONS') {
      ctx.response.status = 200
    }
    try {
      await next()
    } catch (err) {
      console.error('error: ', err)
      ctx.status = err.status || 500
      ctx.body = {
        code: ctx.status,
        message: err.message
      }
    } finally {
      ctx.app.pendingCount -= 1
      if (ctx.app.pendingCount === 0) {
        ctx.app.emit('pendingCount0')
      }
    }
  }
}
