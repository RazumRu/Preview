import {SPECS} from '@config/swagger'
import {
    IAuthService, IPasswordRecoveryDTO, IRefreshTokenDTO,
    ISessionService, IUserLoginDTO, IUserRegisterDTO,
} from '@modules/auth/interfaces'
import {
    Controller,
    Description,
    OperationID,
    Param,
    Post, Request,
    Response,
    Spec,
    Version,
} from '@bibtrip/server'
import CreatedTokenDTO from '@modules/auth/dto/CreatedToken.dto'
import PasswordRecoveryDTO from '@modules/auth/dto/PasswordRecovery.dto'
import RefreshTokenDTO from '@modules/auth/dto/RefreshToken.dto'
import UserLoginDTO from '@modules/auth/dto/UserLogin.dto'
import UserRegisterDTO from '@modules/auth/dto/UserRegister.dto'
import {INJECTION_TYPE, OPERATIONS} from '@src/config'
import {inject} from 'inversify'
import {VERSION} from '@bibtrip/infra'
import {ChildBaseController} from '@bibtrip/server-tools'

@Controller('auth')
@Spec(
    SPECS.AUTH,
    'Auth API',
    `Some methods for authorization and authentication.
    
    After authorization, you receive an authorization token and data for updating it.
    The token is valid for some time, so before each request,
    you must check the expiredAt field to update the token.
    
    You must transfer jwt token in \`authorization\` header. (Bearer {token})`,
)
@Version(VERSION)
export default class AuthController extends ChildBaseController {
    @inject(INJECTION_TYPE.AUTH_SERVICE)
    private readonly authService: IAuthService

    @inject(INJECTION_TYPE.SESSION_SERVICE)
    private readonly sessionService: ISessionService

    @Post()
    @Description(
        'Register new user',
    )
    @OperationID(OPERATIONS.REGISTER)
    @Request(UserRegisterDTO)
    @Response(200, CreatedTokenDTO)
    public async register(
        @Param(UserRegisterDTO) data: IUserRegisterDTO,
    ) {
        return this.authService.userRegister(data)
    }

    @Post()
    @Description(
        'Recovery user password',
        `Send confirm link to email. You can send link again only after certain time.
         After you should call this method again, but with code and password.
         
         Redirect link example: http://bib-trip.com/changePass?uuid=513b8f6d-63ae-44b4-bf86-b51bb25e77ef`,
    )
    @OperationID(OPERATIONS.PASS_RECOVERY)
    @Request(PasswordRecoveryDTO)
    public async passRecovery(
        @Param(PasswordRecoveryDTO) data: IPasswordRecoveryDTO,
    ) {
        return this.authService.passwordRecoveryByEmail(data)
    }

    @Post()
    @Description('Login to app')
    @OperationID(OPERATIONS.LOGIN)
    @Request(UserLoginDTO)
    @Response(200, CreatedTokenDTO)
    public async login(
        @Param(UserLoginDTO) data: IUserLoginDTO,
    ) {
        return this.authService.userLogin(data)
    }

    @Post()
    @Description('Refresh token')
    @OperationID(OPERATIONS.REFRESH_TOKEN)
    @Request(RefreshTokenDTO)
    @Response(200, CreatedTokenDTO)
    public async refreshToken(
        @Param(RefreshTokenDTO) data: IRefreshTokenDTO,
    ) {
        return this.sessionService.refreshSession(data)
    }
}
