const loadModels = require('@galenjs/base')
const loadSequelizeModels = require('@galenjs/sequelize-models')
const buildSwaggerDocs = require('@galenjs/swagger')

const mysql = {
  default: {
    host: '127.0.0.1',
    user: 'root',
    password: 'alfieri',
    database: 'test'
  },
  clients: {
    main: {}
  }
}
const bootstrap = async () => {
  const { remoteMethods, modelSchemas, schemas } = await loadModels({
    workspace: process.cwd(),
    modelPath: 'app/models'
  })
  console.log('----remoteMethods----', JSON.stringify(remoteMethods, null, 2))
  console.log('----modelSchemas----', JSON.stringify(modelSchemas, null, 2))
  console.log('----schemas----', JSON.stringify(schemas, null, 2))
  const db = await loadSequelizeModels(modelSchemas, mysql)
  const data = await db.User.findOne({
    where: { phone: '13222221111' },
    include: ['roles']
  })
  console.log('-------user--------', JSON.stringify(data.toJSON(), null, 2))
  const openApi = await buildSwaggerDocs({
    title: 'galen API document',
    version: 'v3',
    description: 'Galen document'
  }, { schemas, remoteMethods })
  console.log('-------openApi-------', openApi)
}

bootstrap()
