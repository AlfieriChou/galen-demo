const loadSchemas = require('@galenjs/base')
const loadModels = require('@galenjs/typeorm-models')

const config = require('./config')

const bootstrap = async () => {
  const { modelSchemas } = await loadSchemas({
    workspace: process.cwd(),
    modelPath: 'app/models'
  })
  console.log('---schemas-->', modelSchemas)
  const models = await loadModels(modelSchemas, config.typeorm)
  console.log('------>', JSON.stringify(models, null, 2))
}

bootstrap()
