const path = require('path')

module.exports = {
  port: 4000,
  workspace: process.cwd(),
  modelPath: 'app/models',
  sequelize: {
    default: {
      host: '127.0.0.1',
      user: 'root',
      password: 'alfieri',
      database: 'test'
    },
    clients: {
      main: {}
    }
  },
  influx: {
    host: '127.0.0.1',
    database: 'test'
  },
  redis: {
    default: {
      host: '127.0.0.1',
      port: 6379,
      password: '',
      db: 2
    },
    clients: {
      main: {
        keyPrefix: 'main'
      }
    }
  },
  controllerPath: path.join(process.cwd(), '/app/controller'),
  servicePath: path.join(process.cwd(), '/app/service')
}
