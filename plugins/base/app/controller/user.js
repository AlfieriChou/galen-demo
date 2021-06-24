module.exports = class User {
  async register (ctx) {
    const { request: { body: { phone, password } } } = ctx
    const user = await ctx.models.User.findOne({ where: { phone } })
    if (user) {
      ctx.throw(400, 'user is registered')
    }
    const ret = await ctx.models.User.create({
      phone,
      password: await ctx.service.bcrypt.generateHash(password)
    })
    return ret
  }

  async login (ctx) {
    const { request: { body: { phone, password } } } = ctx
    const user = await ctx.models.User.findOne({ where: { phone } })
    if (!user) {
      ctx.throw(400, 'user not registered')
    }
    if (!ctx.service.bcrypt.verifyPassword(user.password, password)) {
      ctx.throw(400, 'password error')
    }
    const token = ctx.service.jwt.createToken({ phone })
    return {
      user,
      token
    }
  }
}
