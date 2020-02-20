import {IServiceBroker} from '@bibtrip/server'
import {IConfigService} from '@modules/config/interfaces'
import {INJECTION_TYPE} from '@src/config'
import {container} from '@src/inversify.cfg'
import '../modules'
import './swagger'
import {init} from '@bibtrip/server-tools'

export default async () => {
    const configService = container.get<IConfigService>(INJECTION_TYPE.CONFIG_SERVICE)
    const serviceBroker = container.get<IServiceBroker>(INJECTION_TYPE.SERVICE_BROKER)

    await init({
        configService,
        serviceBroker,
        container,
    })
}
