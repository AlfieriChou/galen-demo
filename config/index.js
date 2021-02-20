module.exports = {
  port: 4000,
  mysql: {
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
  typeorm: {
    default: {
      host: '127.0.0.1',
      username: 'root',
      password: 'alfieri',
      database: 'typeorm'
    },
    clients: {
      main: {}
    }
  }
}
