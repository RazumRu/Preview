import {IMongoModel, IObjectID, QueryProjection} from '@bibtrip/mongoose'
import {IRespFileDTO} from '@bibtrip/files'
import {IChildRequestInstance} from '@bibtrip/server-tools'

export interface IUserID extends IObjectID {}

export interface IUserData {
    email?: string
    password?: string
    name: string
    nickname: string

    // misc
    age?: number
    phone?: string
    markToContacts?: string
    aboutMe?: string
    avatars?: UUID[]
    languages?: string[]
    facebookUserId?: string,
    googleUserId?: string,
}

export interface IUser extends IUserData, IMongoModel {}

export interface IUserIdDTO {
    userId: IUserID
}

export interface IProfileSettingsDTO {
    name?: string
    age?: number
    markToContacts?: string
    aboutMe?: string
    languages?: string[]
}

export interface IRespProfileDTO {
    _id: IObjectID
    name: string
    nickname: string

    email?: string
    phone?: string

    // misc
    age?: number
    markToContacts?: string
    aboutMe?: string
    avatars: IRespFileDTO[]
    languages: string[]
}

export interface IFilesUUIDsDTO {
    uuids: string[]
}

export interface IUserService {
    getUser(conditions: any, projection?: QueryProjection): Promise<IUser | undefined>
    getUsers(conditions: any, projection?: QueryProjection): Promise<IUser[]>
    createUser(user: IUserData): Promise<IUser>
    updateUser(conditions: any, user: Partial<IUser> | any, one?: boolean): Promise<void>

    checkPass(pass: string, hash: string): boolean
    encryptPass(pass: string): string
}

export interface IProfileService {
    editProfile(req: IChildRequestInstance, data: IProfileSettingsDTO): Promise<void>
    getProfiles(req: IChildRequestInstance, usersIds: IUserID[]): Promise<IRespProfileDTO[]>
    getMyProfile(req: IChildRequestInstance): Promise<IRespProfileDTO>

    addAvatars(req: IChildRequestInstance, files: UUID[]): Promise<IRespFileDTO[]>
    removeAvatars(req: IChildRequestInstance, files?: UUID[]): Promise<void>
}
