import {IPasswordRecoveryDTO} from '@modules/auth/interfaces'
import {
    DataTransferObject,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsPassword,
    PropDescription,
    IsString,
} from '@bibtrip/dto'

export default class PasswordRecoveryDTO
    extends DataTransferObject implements IPasswordRecoveryDTO {
    @IsEmail()
    @IsNotEmpty()
    public email: string

    @IsOptional()
    @IsPassword(Helper.isProd)
    @PropDescription('Only if code exists')
    public password?: string

    @IsOptional()
    @IsString()
    @PropDescription('For confirm email account')
    public code?: string

    public static async fromRawPayload(
        raw: IPasswordRecoveryDTO,
    ): Promise<PasswordRecoveryDTO> {
        const data = new PasswordRecoveryDTO()

        data.email = (raw.email || '').toLowerCase()
        data.password = raw.password
        data.code = raw.code

        return this.validateInstance(data)
    }
}
