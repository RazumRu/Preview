import {IFilesUUIDsDTO} from '@modules/users/interfaces'
import {
    DataTransferObject,
    IsArray,
    IsDefined,
    IsUUID,
} from '@bibtrip/dto'

export default class FilesUUIDsDTO extends DataTransferObject implements IFilesUUIDsDTO {
    @IsArray()
    @IsUUID('4', { each: true })
    @IsDefined()
    public uuids: string[]

    public static async fromRawPayload(raw: IFilesUUIDsDTO): Promise<FilesUUIDsDTO> {
        const data = new FilesUUIDsDTO()

        data.uuids = raw.uuids

        return this.validateInstance(data)
    }
}
