import {SECURITY, SPECS, TAGS} from '@config/swagger'
import {IPhoneFormatter} from '@modules/common/interfaces'
import {
    IFilesUUIDsDTO,
    IProfileService,
    IProfileSettingsDTO,
    IUserService
} from '@modules/users/interfaces'
import {
    Controller, Debug, Delete,
    Description, Get, isAuthorized,
    Middleware,
    OperationID,
    Param, Post, Request, RequestObject, Response, ResponseArray,
    Security,
    Spec, Tags,
    Version,
} from '@bibtrip/server'
import FilesUUIDsDTO from '@modules/users/dto/FilesUUIDs.dto'
import ProfileSettingsDTO from '@modules/users/dto/ProfileSettings.dto'
import RespProfileDTO from '@modules/users/dto/RespProfile.dto'
import {INJECTION_TYPE, OPERATIONS} from '@src/config'
import {inject} from 'inversify'
import {VERSION} from '@bibtrip/infra'
import {ChildBaseController} from '@bibtrip/server-tools'
import {RespFileDTO} from '@bibtrip/files'

@Controller('users')
@Spec(
    SPECS.USERS,
    'Users API',
    `Settings user profile and get profiles`,
)
@Middleware(isAuthorized)
@Security([ SECURITY.BEARER ])
@Version(VERSION)
export default class UsersController extends ChildBaseController {
    @inject(INJECTION_TYPE.PROFILE_SERVICE)
    private readonly profileService: IProfileService

    @inject(INJECTION_TYPE.USER_SERVICE)
    private readonly userService: IUserService

    @inject(INJECTION_TYPE.PHONE_FORMATTER)
    private readonly phoneFormatter: IPhoneFormatter

    @Post()
    @Tags([TAGS.PROFILE])
    @Description('Edit current user profile')
    @OperationID(OPERATIONS.EDIT_MY_PROFILE)
    @Request(ProfileSettingsDTO)
    public async editMyProfile(
        @Param(ProfileSettingsDTO) data: IProfileSettingsDTO,
    ) {
        return this.profileService.editProfile(this.reqInstance, data)
    }

    @Post()
    @Debug()
    @OperationID(OPERATIONS.EDIT_PHONE_WITHOUT_CODE)
    @RequestObject({
        phone: 'string',
    })
    public async editPhoneWithoutCode() {
       await this.userService.updateUser({
            _id: this.reqInstance.getUserId(),
        }, {
            phone: this.phoneFormatter.format(this.data.phone),
        })
    }

    @Get()
    @Tags([TAGS.PROFILE])
    @Description('Get my profile')
    @OperationID(OPERATIONS.GET_MY_PROFILE)
    @Response(200, RespProfileDTO)
    public async getMyProfile() {
        return this.profileService.getMyProfile(this.reqInstance)
    }

    @Post()
    @Tags([TAGS.PROFILE])
    @Description(
        'Add user avatars',
        `Remember that after the first request, thumbnails will not have time to process!`,
    )
    @OperationID(OPERATIONS.ADD_PROFILE_AVATARS)
    @Request(FilesUUIDsDTO)
    @ResponseArray(200, RespFileDTO)
    public async addAvatars(
        @Param(FilesUUIDsDTO) data: IFilesUUIDsDTO,
    ) {
        return this.profileService.addAvatars(this.reqInstance, data.uuids)
    }

    @Delete()
    @Tags([TAGS.PROFILE])
    @Description('Remove user avatars')
    @OperationID(OPERATIONS.REMOVE_PROFILE_AVATARS)
    @Request(FilesUUIDsDTO)
    public async removeAvatars(
        @Param(FilesUUIDsDTO) data: IFilesUUIDsDTO,
    ) {
        return this.profileService.removeAvatars(this.reqInstance, data.uuids)
    }
}
