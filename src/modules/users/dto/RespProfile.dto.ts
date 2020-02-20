import {IObjectID} from '@bibtrip/mongoose'
import {LIMITS} from '@config/limits'
import {IRespProfileDTO, IUser} from '@modules/users/interfaces'
import {
    DataTransferObject,
    IsDefined,
    IsNickname,
    IsNotEmpty,
    IsNumber, IsObjectId,
    IsOptional, IsPhoneNumber, IsString,
    MaxLength, PropDescription, ValidateNested,
} from '@bibtrip/dto'
import {IsEmail} from '@bibtrip/dto'
import {Type} from '@bibtrip/server'
import {RespFileDTO, IRespFileDTO} from '@bibtrip/files'

export default class RespProfileDTO extends DataTransferObject implements IRespProfileDTO {
    @IsNotEmpty()
    @IsObjectId()
    public _id: IObjectID

    @IsNotEmpty()
    @IsString()
    @PropDescription('Just name and surname')
    public name: string

    @IsNotEmpty()
    @IsNickname()
    public nickname: string

    @IsEmail()
    @IsOptional()
    public email?: string

    @IsPhoneNumber('ZZ')
    @IsOptional()
    public phone?: string

    @IsOptional()
    @IsNumber()
    public age?: number

    @IsOptional()
    @IsString()
    @MaxLength(LIMITS.MAX_MARK_TO_CONTACTS_LEN)
    public markToContacts?: string

    @IsOptional()
    @IsString()
    @MaxLength(LIMITS.MAX_MARK_TO_CONTACTS_LEN)
    public aboutMe?: string

    @IsDefined()
    @ValidateNested({ each: true })
    @Type(() => RespFileDTO)
    public avatars: IRespFileDTO[]

    @IsDefined()
    public languages: string[]

    public static async fromEntity(
        user: IUser,
        avatars?: IRespFileDTO[],
    ): Promise<RespProfileDTO> {
        const data = new RespProfileDTO()

        data._id = user._id
        data.name = user.name
        data.nickname = user.nickname

        data.email = user.email
        data.phone = user.phone

        data.age = user.age
        data.markToContacts = user.markToContacts
        data.aboutMe = user.aboutMe
        data.avatars = avatars || []

        return data
    }
}
