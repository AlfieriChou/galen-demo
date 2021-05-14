const createRedis = require('@galenjs/redis')

const config = require('./config')

const bootstrap = async () => {
  const redis = await createRedis(config.redis)
  await redis.set('main', 'test', '1')
  console.log('---->', await redis.get('main', 'test'))
  await redis.setList('main', 'testList', [1, 2, 3, 4])
  console.log('--list-->', await redis.getListLength('main', 'testList'), await redis.getList('main', 'testList', 0, 1))
  await redis.setMembers('main', 'testMember', [1, 2, 3, 4])
  console.log('--member-->', await redis.getMembersLength('main', 'testMember'), await redis.getMembers('main', 'testMember'))
  await redis.setSortedSet('main', 'testSortedSet', [[1, 2], [3, 4]])
  console.log('--sortedSet-->', await redis.getSortedSetLength('main', 'testSortedSet'), await redis.setSortedSet('main', 'testSortedSet', 0, 1))
}

bootstrap()
