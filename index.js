const loadSchemas = require('@galenjs/base')
const loadModels = require('@galenjs/typeorm-models')

const config = require('./config')

const bootstrap = async () => {
  const { modelSchemas } = await loadSchemas({
    workspace: process.cwd(),
    modelPath: 'app/models'
  })
  console.log('---schemas-->', modelSchemas)
  const { models, connections } = await loadModels(modelSchemas, config.typeorm)
  const connection = connections.main
  const data = await connection.getRepository(models.User).find({
    nick_name: 'test'
  })
  console.log('------>', JSON.stringify(data, null, 2))
}

bootstrap()
