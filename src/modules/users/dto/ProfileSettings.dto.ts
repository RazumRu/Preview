import {LIMITS} from '@config/limits'
import {IProfileSettingsDTO} from '@modules/users/interfaces'
import {
    DataTransferObject,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    MinLength, PropDescription,
} from '@bibtrip/dto'

export default class ProfileSettingsDTO extends DataTransferObject implements IProfileSettingsDTO {
    @IsOptional()
    @IsString()
    @MinLength(LIMITS.USER_NAME_LENGTH[0])
    @MaxLength(LIMITS.USER_NAME_LENGTH[1])
    @PropDescription('Just name and surname')
    public name?: string

    @IsOptional()
    @IsNumber()
    @Min(0)
    public age?: number

    @IsOptional()
    @IsString()
    @MaxLength(LIMITS.MAX_MARK_TO_CONTACTS_LEN)
    public markToContacts?: string

    @IsOptional()
    @IsString()
    @MaxLength(LIMITS.MAX_MARK_TO_CONTACTS_LEN)
    public aboutMe?: string

    @IsOptional()
    @IsString({ each: true })
    @PropDescription('Codes of languages spoken by the user')
    @MaxLength(2, { each: true })
    @MinLength(2, { each: true })
    public languages?: string[]

    public static async fromRawPayload(raw: IProfileSettingsDTO): Promise<ProfileSettingsDTO> {
        const data = new ProfileSettingsDTO()

        data.name = raw.name
        data.age = raw.age && parseInt(raw.age as any, 10)
        data.markToContacts = raw.markToContacts
        data.aboutMe = raw.aboutMe
        data.languages = raw.languages

        return this.validateInstance(data)
    }
}
