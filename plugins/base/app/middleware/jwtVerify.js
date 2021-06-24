const ExpireStore = require('expire-store')

const sessionStore = new ExpireStore(60000)

module.exports = () => async (ctx, next) => {
  if (!ctx.headers.authorization) {
    return next()
  }
  const token = ctx.headers.authorization
  let userInfo = sessionStore.get(token)
  if (typeof userInfo === 'undefined') {
    try {
      const payload = await ctx.service.jwt.verifyToken(token)
      userInfo = {
        phone: payload.phone
      }
    } catch (err) {
      ctx.throw(403, 'invalid token')
    }
    sessionStore.set(token, userInfo)
  }
  ctx.user = userInfo
  return next()
}
