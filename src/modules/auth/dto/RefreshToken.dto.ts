import {IRefreshTokenDTO} from '@modules/auth/interfaces'
import {DataTransferObject, IsNotEmpty, IsString} from '@bibtrip/dto'

export default class RefreshTokenDTO extends DataTransferObject implements IRefreshTokenDTO {
    @IsString()
    @IsNotEmpty()
    public token: string

    public static async fromRawPayload(raw: IRefreshTokenDTO): Promise<RefreshTokenDTO> {
        const data = new RefreshTokenDTO()

        data.token = raw.token

        return this.validateInstance(data)
    }
}
