import {IConfigService} from '@modules/config/interfaces'
import {INJECTION_TYPE} from '@src/config'
import {container} from '@src/inversify.cfg'
import db from './db'

export {db}

export default async () => {
    await db()

    const cfg = container.get<IConfigService>(INJECTION_TYPE.CONFIG_SERVICE)
    const connectionConfig = cfg.getConnectionConfig()
    const projectConfig = cfg.getProjectConfig()

    Log.initSentry({
        dsn: connectionConfig.sentryDsn,
        serverName: projectConfig.projectId,
    })
}
