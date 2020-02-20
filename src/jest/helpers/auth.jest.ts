import {
    ICreatedTokenDTO,
    IUserRegisterDTO,
} from '@modules/auth/interfaces'
import {swaggerRequest} from '@bibtrip/jest'
import {OPERATIONS} from '@src/config'
import * as faker from 'faker'
import jsonwebtoken from 'jsonwebtoken'
import {ITokenInfo} from '@bibtrip/server-tools'

export interface IUserAuthData extends IUserRegisterDTO, ICreatedTokenDTO, ITokenInfo {}

export function parseJwtToken(token: string): ITokenInfo {
    return jsonwebtoken.decode(token) as any
}

export async function userAuth(_data?: Partial<IUserRegisterDTO>): Promise<IUserAuthData> {
    const data: IUserRegisterDTO = {
        name: _.get(_data, 'name', faker.random.alphaNumeric(15)),
        nickname: _.get(_data, 'nickname', faker.random.alphaNumeric(15)),
        email: _.get(_data, 'email', faker.internet.email()),
        password: _.get(_data, 'password', faker.internet.password()),
    }

    const resp = await swaggerRequest<ICreatedTokenDTO>(
        undefined,
        OPERATIONS.REGISTER,
        data,
    )

    expect(resp.success).toBeTrue()

    return {
        ...data,
        ...resp.result!,
        ...parseJwtToken(resp.result!.jwt),
    }
}
