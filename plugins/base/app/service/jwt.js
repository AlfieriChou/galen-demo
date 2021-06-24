const jwt = require('jsonwebtoken')
const ExpireStore = require('expire-store')
const config = require('../../config')

class JWTService {
  async verifyToken (token) {
    let payload = JWTService.verifyTokenStore.get(token)
    if (typeof payload === 'undefined') {
      payload = await jwt.verify(token, config.jwt.publicKey, { algorithms: ['RS256'] })
      JWTService.verifyTokenStore.set(token, payload)
    }
    return payload
  }

  createToken (data, expiresIn = '24h') {
    return jwt.sign(data, config.jwt.privateKey, {
      algorithm: 'RS256',
      expiresIn
    })
  }
}

JWTService.verifyTokenStore = new ExpireStore(20000)

module.exports = JWTService
