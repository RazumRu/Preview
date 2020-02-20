import {IPhoneFormatter} from '@modules/common/interfaces'
import {injectable} from 'inversify'
import * as libphonenumber from 'google-libphonenumber'
import PhoneNumberUtil = libphonenumber.PhoneNumberUtil

@injectable()
export default class PhoneFormatter implements IPhoneFormatter {
    private phoneUtil: PhoneNumberUtil

    constructor() {
        this.phoneUtil = libphonenumber.PhoneNumberUtil.getInstance()
    }

    public format(phone: string): string {
        try {
            const raw = this.phoneUtil.parse(phone.replace(/[^0-9+]/g, ''))
            return this.phoneUtil.format(raw, libphonenumber.PhoneNumberFormat.E164)
        } catch (e) {
            return phone
        }
    }
}
