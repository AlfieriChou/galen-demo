const loadModels = require('@galenjs/core')
const path = require('path')

const bootstrap = async () => {
  const modelDirPath = path.join(process.cwd(), './app/models')
  const { remoteMethods, modelSchemas, schemas } = await loadModels(modelDirPath)
  console.log('----remoteMethods----', JSON.stringify(remoteMethods, null, 2))
  console.log('----modelSchemas----', JSON.stringify(modelSchemas, null, 2))
  console.log('----schemas----', JSON.stringify(schemas, null, 2))
}

bootstrap()