import {
    IEmailConfirmService,
} from '@modules/auth/interfaces'
import {IConfigService} from '@modules/config/interfaces'
import {AlreadyExistsError, BadRequestError} from '@bibtrip/errors'
import {IRedisClient} from '@bibtrip/redis'
import {ERROR_CODE, INJECTION_TYPE} from '@src/config'
import {inject, injectable} from 'inversify'
import {INotificationPublisher, MailNotificationDTO,
    EMAIL_TPL,
    IPassRecoveryTplData} from '@bibtrip/notifications'
import uuid from 'uuid'
import { firebasedynamiclinks_v1 } from 'googleapis'
import Firebasedynamiclinks = firebasedynamiclinks_v1.Firebasedynamiclinks

@injectable()
export default class EmailConfirmService implements IEmailConfirmService {
    @inject(INJECTION_TYPE.NOTIFICATION_PUBLISHER)
    private readonly notificationsPublisher: INotificationPublisher

    @inject(INJECTION_TYPE.REDIS_CLIENT)
    private readonly redisClient: IRedisClient

    @inject(INJECTION_TYPE.CONFIG_SERVICE)
    private readonly configService: IConfigService

    private client: Firebasedynamiclinks

    private getFirebaseClient(): Firebasedynamiclinks {
        if (!this.client) {
            const config = this.configService.getFirebaseProjectConfig()
            this.client = new Firebasedynamiclinks({
                auth: config.apiKey,
            })
        }

        return this.client
    }

    private async createShortLink(link: string, domainUriPrefix: string): Promise<string> {
        const config = this.configService.getFirebaseDLinksConfig()
        const client = this.getFirebaseClient()

        const res = await client.shortLinks.create({
            requestBody: {
                dynamicLinkInfo: {
                    link,
                    domainUriPrefix,
                    androidInfo: {
                        androidPackageName: config.androidPackage,
                    },
                    iosInfo: {
                        iosBundleId: config.iosBundleId,
                    },
                },
            },
        })

        if (Helper.empty(res.data.shortLink)) {
            throw new BadRequestError(ERROR_CODE.INCORRECT_SHORT_LINK)
        }

        return res.data.shortLink!
    }

    public async sendRecoveryPassConfirmLink(email: string, userName: string): Promise<void> {
        const config = this.configService.getFirebaseDLinksConfig()
        const _uuid = uuid.v4()

        const check = await this.redisClient.get(email)

        if (check) {
            throw new AlreadyExistsError(
                ERROR_CODE.CONFIRM_EMAIL_IN_PROGRESS,
                'You must wait before resending the email',
            )
        }

        const link = await this.createShortLink(
            `${config.passRedirectUrl}?uuid=${_uuid}`,
            config.domainPrefix,
        )

        const mailData = await MailNotificationDTO.fromRawData({
            to: email,
            tpl: EMAIL_TPL.PASSWORD_RECOVERY,
            data: {
                link,
                userName,
            } as IPassRecoveryTplData,
        })

        await this.notificationsPublisher.publishMail(mailData)
        await this.redisClient.set(email, _uuid, config.linkTimeout)
    }

    public async checkConfirmCode(email: string, code: string): Promise<void> {
        const check = await this.redisClient.get(email)

        if (!check || check !== code) {
            throw new AlreadyExistsError(
                ERROR_CODE.INCORRECT_CONFIRM_CODE,
                'Incorrect confirm code',
            )
        }

        await this.redisClient.del(check)
    }
}
