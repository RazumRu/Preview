import {IUser} from '@modules/users/interfaces'
import {ChildMongooseModel, Field, Schema} from '@bibtrip/mongoose'

@Schema()
class UserModelContainer extends ChildMongooseModel implements IUser {
    @Field({
        required: true,
    })
    public name: string

    @Field()
    public password?: string

    @Field({
        unique: true,
        sparse: true,
    })
    public email?: string

    @Field({
        unique: true,
        sparse: true,
    })
    public phone: string

    @Field({
        unique: true,
        required: true,
    })
    public nickname: string

    @Field()
    public age: number

    @Field()
    public markToContacts?: string

    @Field()
    public aboutMe?: string

    @Field({
        type: [String],
        default: [],
    })
    public avatars: UUID[]

    @Field({
        type: [String],
        default: [],
    })
    public languages: string[]

    @Field({
        unique: true,
        sparse: true,
    })
    public facebookUserId?: string

    @Field({
        unique: true,
        sparse: true,
    })
    public googleUserId?: string
}

const UserModel = UserModelContainer.createModel<IUser>('User')

export { UserModel }
