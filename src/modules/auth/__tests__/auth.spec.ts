import {
    ICreatedTokenDTO, IPasswordRecoveryDTO, IUserLoginDTO,
    IUserRegisterDTO,
} from '@modules/auth/interfaces'
import {cleanUpMongoDatabase, swaggerRequest} from '@bibtrip/jest'
import {ERROR_CODE, OPERATIONS} from '@src/config'
import {userAuth} from '@src/jest/helpers/auth.jest'
import 'firebase/auth'

jest.setTimeout(30000)

describe('Auth API', () => {
    beforeAll(async () => {
        await cleanUpMongoDatabase()
    })

    describe('POST :auth/register', () => {
        it('Must auth for user', async () => {
            await userAuth()
        })

        it('Must return USER_NICKNAME_ALREADY_EXISTS', async () => {
            const user = await userAuth()
            const data: IUserRegisterDTO = {
                name: user.name,
                nickname: user.nickname,
                email: 's.hfghfgh@dgdg.ru',
                password: '1546jhgFgfdg4522',
            }

            const resp = await swaggerRequest<ICreatedTokenDTO>(
                undefined,
                OPERATIONS.REGISTER,
                data,
            )

            expect(resp.success).toBeFalse()
            expect(resp.error!.code).toEqual(ERROR_CODE.USER_NICKNAME_ALREADY_EXISTS)
        })

        it('Must return USER_EMAIL_ALREADY_EXISTS', async () => {
            const user = await userAuth()
            const data: IUserRegisterDTO = {
                name: user.name,
                nickname: 'MyNickname',
                email: user.email,
                password: '1546jhgFgfdg4522',
            }

            const resp = await swaggerRequest<ICreatedTokenDTO>(
                undefined,
                OPERATIONS.REGISTER,
                data,
            )

            expect(resp.success).toBeFalse()
            expect(resp.error!.code).toEqual(ERROR_CODE.USER_EMAIL_ALREADY_EXISTS)
        })

        it('Must return VALIDATION_ERROR', async () => {
            const data: IUserRegisterDTO = {
                name: 'h',
                nickname: 'h',
                email: 's.hfghfgh@dgdg.ru',
                password: '1546jhgFgfdg4522',
            }

            const resp = await swaggerRequest<ICreatedTokenDTO>(
                undefined,
                OPERATIONS.REGISTER,
                data,
            )

            expect(resp.success).toBeFalse()
            expect(resp.error!.code).toEqual(ERROR_CODE.VALIDATION_ERROR)
        })
    })

    describe('POST :auth/login', () => {
        it('Must login for user', async () => {
            const userData = await userAuth()

            // email
            {
                const data: IUserLoginDTO = {
                    login: userData.email,
                    password: userData.password,
                }

                const resp = await swaggerRequest<ICreatedTokenDTO>(
                    undefined,
                    OPERATIONS.LOGIN,
                    data,
                )

                expect(resp.success).toBeTrue()
            }


            // nickname
            {
                const data: IUserLoginDTO = {
                    login: userData.nickname,
                    password: userData.password,
                }

                const resp = await swaggerRequest<ICreatedTokenDTO>(
                    undefined,
                    OPERATIONS.LOGIN,
                    data,
                )

                expect(resp.success).toBeTrue()
            }

            // phone
            {
                const data: IUserLoginDTO = {
                    login: '+79211234567',
                    password: userData.password,
                }

                const respPhone = await swaggerRequest<ICreatedTokenDTO>(
                    userData.jwt,
                    OPERATIONS.EDIT_PHONE_WITHOUT_CODE,
                    {
                        phone: data.login,
                    },
                )

                expect(respPhone.success).toBeTrue()

                const resp = await swaggerRequest<ICreatedTokenDTO>(
                    undefined,
                    OPERATIONS.LOGIN,
                    data,
                )

                expect(resp.success).toBeTrue()
            }
        })

        it('Must return USER_NOT_FOUND', async () => {
            const data: IUserLoginDTO = {
                login: 'gg.iuiyui@ddfg.fg',
                password: 'gh5f8fg4hGhdhfhj',
            }
            const resp = await swaggerRequest<ICreatedTokenDTO>(
                undefined,
                OPERATIONS.LOGIN,
                data,
            )

            expect(resp.success).toBeFalse()
            expect(resp.error!.code).toEqual(ERROR_CODE.USER_NOT_FOUND)
        })
    })

    describe('POST :auth/refreshToken', () => {
        it('must refresh token', async () => {
            const data = await userAuth()

            const resp = await swaggerRequest<ICreatedTokenDTO>(
                undefined,
                OPERATIONS.REFRESH_TOKEN,
                {
                    token: data.refresh,
                },
            )

            expect(resp.success).toBeTrue()
            expect(resp.result.jwt !== data.jwt).toBeTrue()
            expect(resp.result.refresh !== data.refresh).toBeTrue()
            expect(resp.result.refreshExpiredAt > data.refreshExpiredAt).toBeTrue()
            expect(resp.result.jwtExpiredAt > data.jwtExpiredAt).toBeTrue()
        })

        it('must throw SESSION_NOT_FOUND error', async () => {
            // invalid uuid
            {
                const resp = await swaggerRequest<ICreatedTokenDTO>(
                    undefined,
                    OPERATIONS.REFRESH_TOKEN,
                    {
                        token: 'ghjghj',
                    },
                )

                expect(resp.success).toBeFalse()
                expect(resp.error!.code).toEqual(ERROR_CODE.SESSION_NOT_FOUND)
            }

            // expired
            {
                const data = await userAuth()

                const resp: any = await new Promise(res => {
                    setTimeout(async () => {
                        const resp = await swaggerRequest<ICreatedTokenDTO>(
                            undefined,
                            OPERATIONS.REFRESH_TOKEN,
                            {
                                token: data.refresh,
                            },
                        )

                        res(resp)
                    }, (parseInt(process.env.JWT_REFRESH_EXPIRES_IN!, 10) + 1) * 1000)
                })

                expect(resp.success).toBeFalse()
                expect(resp.error!.code).toEqual(ERROR_CODE.SESSION_NOT_FOUND)
            }
        })
    })

    describe('POST :auth/passRecovery', () => {
        it('Must change pass', async () => {
            const user = await userAuth()
            const password = '45gtTGh8884gsgd'

            // send code
            {
                const data: IPasswordRecoveryDTO = {
                    email: user.email,
                }

                const resp = await swaggerRequest(
                    undefined,
                    OPERATIONS.PASS_RECOVERY,
                    data,
                )

                expect(resp.success).toBeTrue()
            }

            // change pass
            {
                const data: IPasswordRecoveryDTO = {
                    email: user.email,
                    code: '123456',
                    password,
                }

                const resp = await swaggerRequest(
                    undefined,
                    OPERATIONS.PASS_RECOVERY,
                    data,
                )

                expect(resp.success).toBeTrue()
            }

            // login
            {
                const data: IUserLoginDTO = {
                    login: user.email,
                    password,
                }

                const resp = await swaggerRequest<ICreatedTokenDTO>(
                    undefined,
                    OPERATIONS.LOGIN,
                    data,
                )

                expect(resp.success).toBeTrue()
            }
        })

        it('Must return CONFIRM_EMAIL_IN_PROGRESS', async () => {
            const user = await userAuth()

            // send code
            {
                const data: IPasswordRecoveryDTO = {
                    email: user.email,
                }

                const resp = await swaggerRequest(
                    undefined,
                    OPERATIONS.PASS_RECOVERY,
                    data,
                )

                expect(resp.success).toBeTrue()
            }

            // second send code
            {
                const data: IPasswordRecoveryDTO = {
                    email: user.email,
                }

                const resp = await swaggerRequest(
                    undefined,
                    OPERATIONS.PASS_RECOVERY,
                    data,
                )

                expect(resp.success).toBeFalse()
                expect(resp.error!.code).toEqual(ERROR_CODE.CONFIRM_EMAIL_IN_PROGRESS)
            }
        })

        it('Must return INCORRECT_CONFIRM_CODE', async () => {
            const user = await userAuth()

            // send code
            {
                const data: IPasswordRecoveryDTO = {
                    email: user.email,
                }

                const resp = await swaggerRequest(
                    undefined,
                    OPERATIONS.PASS_RECOVERY,
                    data,
                )

                expect(resp.success).toBeTrue()
            }

            // change pass
            {
                const data: IPasswordRecoveryDTO = {
                    email: user.email,
                    code: '55555',
                    password: 'newTestPass123',
                }

                const resp = await swaggerRequest(
                    undefined,
                    OPERATIONS.PASS_RECOVERY,
                    data,
                )

                expect(resp.success).toBeFalse()
                expect(resp.error!.code).toEqual(ERROR_CODE.INCORRECT_CONFIRM_CODE)
            }
        })

        it('Must return PASSWORD_INCORRECT', async () => {
            const user = await userAuth()

            // change pass
            {
                const data: IPasswordRecoveryDTO = {
                    email: user.email,
                    code: '55555',
                }

                const resp = await swaggerRequest(
                    undefined,
                    OPERATIONS.PASS_RECOVERY,
                    data,
                )

                expect(resp.success).toBeFalse()
                expect(resp.error!.code).toEqual(ERROR_CODE.PASSWORD_INCORRECT)
            }
        })
    })
})
