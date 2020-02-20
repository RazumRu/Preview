import {ICreatedTokenDTO} from '@modules/auth/interfaces'
import {
    DataTransferObject,
    IsDefined,
    IsJWT,
    IsLongDate,
    IsNotEmpty,
    IsString,
    JSONSchema,
} from '@bibtrip/dto'

export default class CreatedTokenDTO extends DataTransferObject implements ICreatedTokenDTO {
    @IsString()
    @IsNotEmpty()
    @IsJWT()
    public jwt: string

    @IsString()
    @IsNotEmpty()
    @JSONSchema({
        description: 'You can use this token for update jwt token',
    })
    public refresh: string

    @IsLongDate()
    @IsDefined()
    @JSONSchema({
        description: 'When expires refresh token',
    })
    public refreshExpiredAt: LongDate

    @IsLongDate()
    @IsDefined()
    @JSONSchema({
        description: 'When expires jwt token',
    })
    public jwtExpiredAt: LongDate

    public static async fromEntity(entity: ICreatedTokenDTO): Promise<CreatedTokenDTO> {
        const data = new CreatedTokenDTO()

        data.jwt = entity.jwt
        data.refresh = entity.refresh
        data.refreshExpiredAt = entity.refreshExpiredAt
        data.jwtExpiredAt = entity.jwtExpiredAt

        return data
    }
}
