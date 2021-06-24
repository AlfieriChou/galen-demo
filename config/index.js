module.exports = {
  port: 4000,
  plugin: {
    mainPath: 'plugins',
    plugins: ['base', 'doc']
  },
  workspace: process.cwd(),
  modelPath: 'app/models',
  controllerPath: 'app/controller',
  servicePath: 'app/service',
  middlewarePath: 'app/middleware',
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
  }
}
