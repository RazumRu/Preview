import {
    ICreatedTokenDTO, IRefreshTokenDTO, ISessionService, IUserSession,
} from '@modules/auth/interfaces'
import {NotFoundError} from '@bibtrip/errors'
import {IRedisClient} from '@bibtrip/redis'
import CreatedTokenDTO from '@modules/auth/dto/CreatedToken.dto'
import {IConfigService} from '@modules/config/interfaces'
import {ERROR_CODE, INJECTION_TYPE} from '@src/config'
import {inject, injectable} from 'inversify'
import jsonwebtoken from 'jsonwebtoken'
import ms from 'ms'
import uuid from 'uuid'
import {ITokenInfo} from '@bibtrip/server-tools'

@injectable()
export default class SessionService implements ISessionService {
    @inject(INJECTION_TYPE.CONFIG_SERVICE)
    private readonly cfgService: IConfigService

    @inject(INJECTION_TYPE.REDIS_CLIENT)
    private readonly redisClient: IRedisClient

    private async createDTO(data: ITokenInfo): Promise<ICreatedTokenDTO> {
        const cfg = await this.cfgService.getServerConfig()

        const jwt = jsonwebtoken.sign(data, cfg.jwtSecretKey, {
            expiresIn: cfg.jwtExpiresIn,
        })

        const refreshExpiredAt = Date.now() + ms(cfg.jwtRefreshExpiresIn)
        const jwtExpiredAt = Date.now() + ms(cfg.jwtExpiresIn)
        const refresh = uuid.v4()

        return CreatedTokenDTO.fromEntity({jwt, refresh, refreshExpiredAt, jwtExpiredAt})
    }

    public async createSession(data: ITokenInfo): Promise<ICreatedTokenDTO> {
        const dto = await this.createDTO(data)

        const session: IUserSession = {
            userId: data.userId,
            uuid: dto.refresh,
            expiredAt: new Date(dto.refreshExpiredAt),
            type: data.type,
        }

        await this.redisClient.set(
            dto.refresh,
            session,
            Math.ceil((dto.refreshExpiredAt - Date.now()) / 1000),
        )

        return dto
    }

    public async refreshSession(tokenData: IRefreshTokenDTO): Promise<ICreatedTokenDTO> {
        const session: IUserSession = await this.redisClient.get(tokenData.token)

        if (!session) {
            throw new NotFoundError(ERROR_CODE.SESSION_NOT_FOUND)
        }

        await this.redisClient.del(tokenData.token)

        const data: ITokenInfo = {
            userId: session.userId,
            type: session.type,
        }

        return this.createSession(data)
    }
}
