import {
    IProfileService,
    IProfileSettingsDTO,
    IRespProfileDTO,
    IUser, IUserID, IUserService,
} from '@modules/users/interfaces'
import {NotFoundError} from '@bibtrip/errors'
import RespProfileDTO from '@modules/users/dto/RespProfile.dto'
import {ERROR_CODE, INJECTION_TYPE} from '@src/config'
import {inject, injectable} from 'inversify'
import util from 'util'
import {IFilesBroker, IRespFileDTO} from '@bibtrip/files'
import {IChildRequestInstance} from '@bibtrip/server-tools'

@injectable()
export default class ProfileService implements IProfileService {
    @inject(INJECTION_TYPE.USER_SERVICE)
    private readonly userService: IUserService

    @inject(INJECTION_TYPE.FILES_BROKER)
    private readonly filesBroker: IFilesBroker

    private async prepareUsers(
        req: IChildRequestInstance,
        users: IUser[],
    ): Promise<IRespProfileDTO[]> {
        return Promise.all(users.map(async (u) => {
            const avatars = u.avatars && await this.filesBroker.getAvatars(req, u.avatars)
                .catch(err => {
                    Log.sentryError(err)
                    return undefined
                })

            return RespProfileDTO.fromEntity(
                u,
                avatars && Array.from(avatars.values()),
            )
        }))
    }

    public async editProfile(
        req: IChildRequestInstance,
        data: IProfileSettingsDTO,
    ): Promise<void> {
        await this.userService.updateUser({
            _id: req.getUserId(),
        }, _.omitBy(data, util.isNullOrUndefined))
    }

    public async getProfiles(
        req: IChildRequestInstance,
        usersIds: IUserID[],
    ): Promise<IRespProfileDTO[]> {
        const users = await this.userService.getUsers(
            {_id: { $in: usersIds }},
            `name nickname email phone
            age markToContacts aboutMe
            avatars languages`
        )

        return this.prepareUsers(req, users)
    }

    public async getMyProfile(req: IChildRequestInstance): Promise<IRespProfileDTO> {
        const profiles = await this.getProfiles(req, [req.getUserId()])

        const myProfile = profiles.pop()

        if (!myProfile) {
            throw new NotFoundError(ERROR_CODE.USER_NOT_FOUND)
        }

        return myProfile
    }

    public async addAvatars(
        req: IChildRequestInstance,
        uuids: UUID[],
    ): Promise<IRespFileDTO[]> {
        const files = await this.filesBroker.getAvatars(req, uuids)

        await this.userService.updateUser({
            _id: req.getUserId(),
        }, {
            avatars: Array.from(files.keys()),
        })

        return Array.from(files.values())
    }

    public async removeAvatars(
        req: IChildRequestInstance,
        uuids: UUID[],
    ): Promise<void> {
        await this.userService.updateUser({
            _id: req.getUserId(),
        }, {
            $pull: { avatars: { $in: uuids } },
        })
    }
}
