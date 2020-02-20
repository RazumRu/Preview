import {IConfigService} from '@modules/config/interfaces'
import {INJECTION_TYPE} from '@src/config'
import {container} from '@src/inversify.cfg'
import {IRedisClient} from '@bibtrip/redis'
import {connectToDb} from '@bibtrip/infra'

export default async function (mongodbURL?: string): Promise<any> {
    const redisClient = container.get<IRedisClient>(INJECTION_TYPE.REDIS_CLIENT)

    if (!mongodbURL) {
        const cfg = container.get<IConfigService>(INJECTION_TYPE.CONFIG_SERVICE)
        const connectionConfig = await cfg.getConnectionConfig()
        mongodbURL = connectionConfig.mongoUrl
    }

    return connectToDb(redisClient, mongodbURL)
}
