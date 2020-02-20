import {
    ICreatedTokenDTO,
} from '@modules/auth/interfaces'
import {IFilesUUIDsDTO, IProfileSettingsDTO, IRespProfileDTO} from '@modules/users/interfaces'
import {genUUID, swaggerRequest} from '@bibtrip/jest'
import {OPERATIONS} from '@src/config'
import {userAuth} from '@src/jest/helpers/auth.jest'
import {IRespFileDTO} from '@bibtrip/files'

jest.setTimeout(30000)

async function getMyProfile(jwt: string): Promise<IRespProfileDTO> {
    const resp = await swaggerRequest<IRespProfileDTO>(
        jwt,
        OPERATIONS.GET_MY_PROFILE,
    )

    return resp.result
}

describe('Users API', () => {
    describe('GET :users/getMyProfile', () => {
        it('Must get my profile', async () => {
            const user = await userAuth()

            const profile = await getMyProfile(user.jwt)
            expect(profile.name).toBeString()
            expect(profile.nickname).toBeString()
            expect(profile.email).toBeString()
            expect(profile.languages).toBeArray()
        })
    })

    describe('POST :users/editMyProfile', () => {
        it('Must edit my profile', async () => {
            const user = await userAuth()

            const data: IProfileSettingsDTO = {
                name: 'newName',
                age: 18,
                markToContacts: 'testMark',
                aboutMe: 'testMark',
                languages: ['ru', 'en'],
            }

            // first req
            {
                const resp = await swaggerRequest<ICreatedTokenDTO>(
                    user.jwt,
                    OPERATIONS.EDIT_MY_PROFILE,
                    data,
                )

                expect(resp.success).toBeTrue()

                const profile = await getMyProfile(user.jwt)
                expect(profile).toMatchObject({
                    ...data,
                    languages: [
                        {code: 'ru'},
                        {code: 'en'},
                    ],
                })
            }

            // second req
            {
                const resp = await swaggerRequest<ICreatedTokenDTO>(
                    user.jwt,
                    OPERATIONS.EDIT_MY_PROFILE,
                    {
                        name: 'newName2',
                    },
                )

                expect(resp.success).toBeTrue()

                const profile = await getMyProfile(user.jwt)
                expect(profile).toMatchObject({
                    ...data,
                    languages: [
                        {code: 'ru'},
                        {code: 'en'},
                    ],
                    name: 'newName2',
                })
            }
        })
    })

    describe('POST :users/addAvatars', () => {
        it('Must add avatars to my profile', async () => {
            const user = await userAuth()

            const data: IFilesUUIDsDTO = {
                uuids: [genUUID()],
            }

            const resp = await swaggerRequest<IRespFileDTO[]>(
                user.jwt,
                OPERATIONS.ADD_PROFILE_AVATARS,
                data,
            )

            expect(resp.success).toBeTrue()
            expect(resp.result).toBeArrayOfSize(data.uuids.length)
            expect(resp.result[0]!.uuid).toEqual(data.uuids[0])

            const profile = await getMyProfile(user.jwt)
            expect(profile.avatars).toBeArrayOfSize(1)
            expect(profile.avatars[0]!.uuid).toEqual(data.uuids[0])
        })
    })

    describe('POST :users/removeAvatars', () => {
        it('Must remove avatars from my profile', async () => {
            const user = await userAuth()

            const data: IFilesUUIDsDTO = {
                uuids: [genUUID(), genUUID()],
            }

            // add
            {
                const resp = await swaggerRequest<IRespFileDTO[]>(
                    user.jwt,
                    OPERATIONS.ADD_PROFILE_AVATARS,
                    data,
                )

                expect(resp.success).toBeTrue()
                expect(resp.result).toBeArrayOfSize(data.uuids.length)

                const profile = await getMyProfile(user.jwt)
                expect(profile.avatars).toBeArrayOfSize(2)
            }

            // remove
            {
                const resp = await swaggerRequest<IRespFileDTO[]>(
                    user.jwt,
                    OPERATIONS.REMOVE_PROFILE_AVATARS,
                    {
                        uuids: [data.uuids[0]],
                    },
                )

                expect(resp.success).toBeTrue()
            }

            const profile = await getMyProfile(user.jwt)
            expect(profile.avatars).toBeArrayOfSize(1)
            expect(profile.avatars[0]!.uuid).toEqual(data.uuids[1])
        })
    })
})
