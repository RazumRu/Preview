import {
    IAuthService, IEmailConfirmService,
    ISessionService,
} from '@modules/auth/interfaces'
import PhoneFormatter from '@modules/common/classes/PhoneFormatter'
import {IPhoneFormatter} from '@modules/common/interfaces'
import {IConfigService} from '@modules/config/interfaces'
import ConfigService from '@modules/config/services/Config.svc'
import {IProfileService, IUserService} from '@modules/users/interfaces'
import {IQueueClient, QueueClient} from '@bibtrip/queue'
import {IRedisClient, RedisClient} from '@bibtrip/redis'
import {IServiceBroker, ServiceBroker} from '@bibtrip/server'
import AuthService from '@modules/auth/services/Auth.svc'
import EmailConfirmFakeService from '@modules/auth/services/EmailConfirm.fake.svc'
import EmailConfirmService from '@modules/auth/services/EmailConfirm.svc'
import SessionService from '@modules/auth/services/Session.svc'
import ProfileSvc from '@modules/users/services/Profile.svc'
import UserSvc from '@modules/users/services/User.svc'
import {INJECTION_TYPE} from '@src/config'
import { Container } from 'inversify'
import {ServiceBrokerRequestor, IServiceBrokerRequestor} from '@bibtrip/server-tools'
import {IFilesBroker, FakeFilesBroker, FilesBroker} from '@bibtrip/files'
import {INotificationPublisher, NotificationPublisher} from '@bibtrip/notifications'

export const container = new Container()

container
    .bind<IConfigService>(INJECTION_TYPE.CONFIG_SERVICE)
    .toConstantValue(new ConfigService())

const cfg = container.get<IConfigService>(INJECTION_TYPE.CONFIG_SERVICE)
const connectionConfig = cfg.getConnectionConfig()
const projectConfig = cfg.getProjectConfig()

const serviceBroker = new ServiceBroker({
    logger: Helper.isTest,
    nodeID: projectConfig.projectId,
    transporter: connectionConfig.serviceBrokerTransporter,
})

const serviceBrokerRequestor = new ServiceBrokerRequestor(serviceBroker)

container
    .bind<IServiceBroker>(INJECTION_TYPE.SERVICE_BROKER)
    .toConstantValue(serviceBroker)

container
    .bind<IServiceBrokerRequestor>(INJECTION_TYPE.SERVICE_BROKER_REQUESTOR)
    .toConstantValue(serviceBrokerRequestor)

container
    .bind<IFilesBroker>(INJECTION_TYPE.FILES_BROKER)
    .toConstantValue(Helper.isTest
        ? new FakeFilesBroker()
        : new FilesBroker(serviceBrokerRequestor),
    )

container
    .bind<IRedisClient>(INJECTION_TYPE.REDIS_CLIENT)
    .toConstantValue(new RedisClient(connectionConfig.redisUrl))

const queueClient = new QueueClient(connectionConfig.rabbitMqUrl!)
container
    .bind<IQueueClient>(INJECTION_TYPE.QUEUE_CLIENT)
    .toConstantValue(queueClient)

container
    .bind<INotificationPublisher>(INJECTION_TYPE.NOTIFICATION_PUBLISHER)
    .toConstantValue(new NotificationPublisher(queueClient))

// modules
container
    .bind<IAuthService>(INJECTION_TYPE.AUTH_SERVICE)
    .to(AuthService)

container
    .bind<IEmailConfirmService>(INJECTION_TYPE.EMAIL_CONFIRM_SERVICE)
    .to(Helper.env('FAKE_EMAIL_CONFIRM', true) ? EmailConfirmFakeService : EmailConfirmService)
    .inSingletonScope()

container
    .bind<ISessionService>(INJECTION_TYPE.SESSION_SERVICE)
    .to(SessionService)

container
    .bind<IUserService>(INJECTION_TYPE.USER_SERVICE)
    .to(UserSvc)

container
    .bind<IProfileService>(INJECTION_TYPE.PROFILE_SERVICE)
    .to(ProfileSvc)

// common
container
    .bind<IPhoneFormatter>(INJECTION_TYPE.PHONE_FORMATTER)
    .to(PhoneFormatter)
    .inSingletonScope()
