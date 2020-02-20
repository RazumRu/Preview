import {
    IAuthService,
    ICreatedTokenDTO,
    IEmailConfirmService,
    IPasswordRecoveryDTO,
    ISessionService,
    IUserLoginDTO,
    IUserRegisterDTO,
} from '@modules/auth/interfaces'
import {IPhoneFormatter} from '@modules/common/interfaces'
import {IUserService} from '@modules/users/interfaces'
import {AlreadyExistsError, NotFoundError, ValidationError} from '@bibtrip/errors'
import {ERROR_CODE, INJECTION_TYPE} from '@src/config'
import {inject, injectable} from 'inversify'
import {AUTH_TOKEN_TYPE} from '@bibtrip/server-tools'

@injectable()
export default class AuthService implements IAuthService {
    @inject(INJECTION_TYPE.SESSION_SERVICE)
    private readonly sessionService: ISessionService

    @inject(INJECTION_TYPE.USER_SERVICE)
    private readonly userService: IUserService

    @inject(INJECTION_TYPE.EMAIL_CONFIRM_SERVICE)
    private readonly emailConfirmService: IEmailConfirmService

    @inject(INJECTION_TYPE.PHONE_FORMATTER)
    private readonly phoneFormatter: IPhoneFormatter

    public async userRegister(data: IUserRegisterDTO): Promise<ICreatedTokenDTO> {
        data.password = this.userService.encryptPass(data.password)

        const checkUser = await this.userService.getUser(
            {
                $or: [
                    {email: data.email },
                    {nickname: data.nickname },
                ],
            },
            'email nickname name',
        )

        if (checkUser) {
            if (checkUser.email === data.email) {
                throw new AlreadyExistsError(
                    ERROR_CODE.USER_EMAIL_ALREADY_EXISTS,
                    'User with this email already exists',
                )
            }

            if (checkUser.nickname === data.nickname) {
                throw new AlreadyExistsError(
                    ERROR_CODE.USER_NICKNAME_ALREADY_EXISTS,
                    'User with this nickname already exists',
                )
            }

            throw new AlreadyExistsError(
                ERROR_CODE.USER_ALREADY_EXISTS,
                'User already exists',
            )
        }

        const user = await this.userService.createUser(data)

        return this.sessionService.createSession({
            type: AUTH_TOKEN_TYPE.USER,
            userId: user._id,
        })
    }

    public async userLogin(data: IUserLoginDTO): Promise<ICreatedTokenDTO> {
        const user = await this.userService.getUser(
            {
               $or: [
                   { email: data.login.toLowerCase() },
                   { nickname: data.login },
                   { phone: this.phoneFormatter.format(data.login) },
               ]
            },
            'password',
        )

        if (!user) {
            throw new NotFoundError(
                ERROR_CODE.USER_NOT_FOUND,
                'User not found',
            )
        }

        if (!user.password || !this.userService.checkPass(data.password, user.password)) {
            throw new ValidationError(
                ERROR_CODE.PASSWORD_INCORRECT,
                'Password incorrect',
            )
        }

        return this.sessionService.createSession({
            type: AUTH_TOKEN_TYPE.USER,
            userId: user._id,
        })
    }

    public async passwordRecoveryByEmail(data: IPasswordRecoveryDTO): Promise<void> {
        const user = await this.userService.getUser(
            { email: data.email },
            'name email',
        )

        if (!user) {
            throw new NotFoundError(ERROR_CODE.USER_NOT_FOUND)
        }

        if (data.code) {
            if (Helper.empty(data.password)) {
                throw new ValidationError(ERROR_CODE.PASSWORD_INCORRECT)
            }

            await this.emailConfirmService.checkConfirmCode(data.email, data.code)

            data.password = this.userService.encryptPass(data.password!)

            await this.userService.updateUser({
                email: data.email,
            }, {
                password: data.password,
            }, true)
        } else {
            await this.emailConfirmService.sendRecoveryPassConfirmLink(user.email!, user.name)
        }
    }
}
