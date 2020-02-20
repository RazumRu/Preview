import {
    IUser, IUserData,
    IUserService,
} from '@modules/users/interfaces'
import {QueryProjection} from '@bibtrip/mongoose'
import {UserModel} from '@src/models/User.model'
import bcrypt from 'bcrypt-nodejs'
import {injectable} from 'inversify'

@injectable()
export default class UserService implements IUserService {
    public encryptPass(pass: string): string {
        return bcrypt.hashSync(pass)
    }

    public checkPass(pass: string, hash: string): boolean {
        return bcrypt.compareSync(pass, hash)
    }

    public async getUser(
        conditions: any,
        projection?: QueryProjection,
    ): Promise<IUser | undefined> {
        const usersQuery = UserModel
            .findOne(conditions)

        if (projection) {
            usersQuery.select(projection)
        }

        return usersQuery.lean().exec()
    }

    public async getUsers(
        conditions: any,
        projection?: QueryProjection,
    ): Promise<IUser[]> {
        const usersQuery = UserModel
            .find(conditions)

        if (projection) {
            usersQuery.select(projection)
        }

        return usersQuery.lean().exec()
    }

    public async createUser(user: IUserData): Promise<IUser> {
        return UserModel.create(user)
    }

    public async updateUser(conditions: any, user: Partial<IUser>, one = true): Promise<void> {
        if (!user) { return }

        user.updatedAt = new Date()

        if (one) {
            await UserModel.updateOne(conditions, user)
        } else {
            await UserModel.update(conditions, user)
        }
    }
}
