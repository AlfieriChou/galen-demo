const ExpireStore = require('expire-store')

class User {
  async cacheGetUserByPhone (phone, ctx) {
    let user = User.phoneStore.get(phone)
    if (typeof user === 'undefined') {
      const userRet = await ctx.models.User.findOne({
        where: { phone },
        include: [{
          model: ctx.models.Role,
          as: 'roles'
        }]
      })
      user = userRet.toJSON()
      User.phoneStore.set(phone, user)
    }
    return user
  }
}

User.phoneStore = new ExpireStore(20000)

module.exports = User
