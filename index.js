const loadModels = require('@galenjs/core')
const loadSequelizeModels = require('@galenjs/sequelize-models')
const buildSwaggerDocs = require('@galenjs/swagger')
const path = require('path')

const mysql = {
  host: '127.0.0.1',
  user: 'root',
  password: 'alfieri',
  database: 'test'
}

const bootstrap = async () => {
  const modelDirPath = path.join(process.cwd(), './app/models')
  const { remoteMethods, modelSchemas, schemas } = await loadModels(modelDirPath)
  console.log('----remoteMethods----', JSON.stringify(remoteMethods, null, 2))
  console.log('----modelSchemas----', JSON.stringify(modelSchemas, null, 2))
  console.log('----schemas----', JSON.stringify(schemas, null, 2))
  const db = await loadSequelizeModels(modelSchemas, { mysql })
  console.log('-------user--------', await db.User.findOne({ where: { phone: '13222221111' }}))
  const openApi = await buildSwaggerDocs({
    title: "galen API document",
    version: "v3",
    description: "Galen document"
  }, { schemas, remoteMethods })
  console.log('-------openApi-------', openApi)
}

bootstrap()