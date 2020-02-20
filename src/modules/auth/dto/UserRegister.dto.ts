import {LIMITS} from '@config/limits'
import {IUserRegisterDTO} from '@modules/auth/interfaces'
import {
    DataTransferObject,
    IsEmail,
    IsNickname,
    IsNotEmpty,
    IsPassword,
    IsString,
    MaxLength,
    MinLength,
    PropDescription,
} from '@bibtrip/dto'

export default class UserRegisterDTO extends DataTransferObject implements IUserRegisterDTO {
    @IsEmail()
    @IsNotEmpty()
    public email: string

    @IsNotEmpty()
    @IsPassword(Helper.isProd)
    public password: string

    @IsNotEmpty()
    @IsString()
    @MinLength(LIMITS.USER_NAME_LENGTH[0])
    @MaxLength(LIMITS.USER_NAME_LENGTH[1])
    @PropDescription('Just name and surname')
    public name: string

    @IsNotEmpty()
    @IsNickname()
    public nickname: string

    public static async fromRawPayload(raw: IUserRegisterDTO): Promise<UserRegisterDTO> {
        const data = new UserRegisterDTO()

        data.email = (raw.email || '').toLowerCase()
        data.password = raw.password
        data.name = raw.name
        data.nickname = raw.nickname

        return this.validateInstance(data)
    }
}
