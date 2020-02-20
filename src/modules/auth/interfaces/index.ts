import {IUserID} from '@modules/users/interfaces'
import {ITokenInfo, AUTH_TOKEN_TYPE} from '@bibtrip/server-tools'

export interface IAuthService {
    userRegister(data: IUserRegisterDTO): Promise<ICreatedTokenDTO>
    userLogin(data: IUserLoginDTO): Promise<ICreatedTokenDTO>
    passwordRecoveryByEmail(data: IPasswordRecoveryDTO): Promise<void>
}

export interface ISessionService {
    createSession(data: ITokenInfo): Promise<ICreatedTokenDTO>
    refreshSession(data: IRefreshTokenDTO): Promise<ICreatedTokenDTO>
}

export interface IEmailConfirmService {
    sendRecoveryPassConfirmLink(email: string, userName: string): Promise<void>
    checkConfirmCode(email: string, code: string): Promise<void>
}

export interface IOAuthProfile {
    id: string
    email?: string
    name?: string
}

export interface IUserSession {
    userId: IUserID
    uuid: string
    expiredAt: Date
    type: AUTH_TOKEN_TYPE
}

export interface IRefreshTokenDTO {
    token: string
}

export interface ICreatedTokenDTO {
    jwt: string
    refresh: string
    refreshExpiredAt: LongDate
    jwtExpiredAt: LongDate
}

export interface IUserRegisterDTO {
    email: string
    password: string
    name: string
    nickname: string
}

export interface IUserLoginDTO {
    login: string
    password: string
}

export interface IPasswordRecoveryDTO {
    email: string
    code?: string
    password?: string
}
