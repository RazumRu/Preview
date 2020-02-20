import {
    IEmailConfirmService,
} from '@modules/auth/interfaces'
import {AlreadyExistsError} from '@bibtrip/errors'
import {ERROR_CODE} from '@src/config'
import {injectable} from 'inversify'

@injectable()
export default class EmailConfirmFakeService implements IEmailConfirmService {

    private async sendConfirmCode(
        email: string,
    ): Promise<void> {
        const timeout = Helper.env('CONFIRM_EMAIL_TIMEOUT', 300)
        const code = '123456'

        const check = this.codes.get(email)

        if (check && check.t >= new Date()) {
            throw new AlreadyExistsError(
                ERROR_CODE.CONFIRM_EMAIL_IN_PROGRESS,
                'You must wait before resending the email',
            )
        }

        this.codes.set(email, {code, t: new Date(Date.now() + timeout * 1000)})
    }
    public codes = new Map<string, {code: string, t: Date}>()

    public async sendRecoveryPassConfirmLink(email: string, _userName: string): Promise<void> {
        return this.sendConfirmCode(email)
    }

    public async checkConfirmCode(email: string, code: string): Promise<void> {
        const check = this.codes.get(email)

        if (!check || check.code !== code) {
            throw new AlreadyExistsError(
                ERROR_CODE.INCORRECT_CONFIRM_CODE,
                'Incorrect confirm code',
            )
        }

        await this.codes.delete(email)
    }
}
