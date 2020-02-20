import {IUserID, IUserIdDTO} from '@modules/users/interfaces'
import {DataTransferObject, IsNotEmpty, IsObjectId} from '@bibtrip/dto'

export default class UserIdDTO extends DataTransferObject implements IUserIdDTO {
    @IsNotEmpty()
    @IsObjectId()
    public userId: IUserID

    public static async fromRawPayload(raw: IUserIdDTO): Promise<UserIdDTO> {
        const data = new UserIdDTO()

        data.userId = raw.userId

        return this.validateInstance(data)
    }
}
