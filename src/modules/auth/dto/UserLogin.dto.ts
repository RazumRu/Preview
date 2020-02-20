import {IUserLoginDTO} from '@modules/auth/interfaces'
import {DataTransferObject, IsNotEmpty, IsPassword, IsString, PropDescription} from '@bibtrip/dto'

export default class UserLoginDTO extends DataTransferObject implements IUserLoginDTO {
    @IsString()
    @IsNotEmpty()
    @PropDescription('Email, username or phone')
    public login: string

    @IsNotEmpty()
    @IsPassword(Helper.isProd)
    public password: string

    public static async fromRawPayload(raw: IUserLoginDTO): Promise<UserLoginDTO> {
        const data = new UserLoginDTO()

        data.login = raw.login || (raw as any).email
        data.password = raw.password

        return this.validateInstance(data)
    }
}
