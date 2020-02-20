import {ConfigService as ParentConfigService} from '@bibtrip/config'
import {
    IConfigService, IFirebaseDLinksConfig, IFirebaseProjectConfig,
    IMapBoxConfig, IServerConfig
} from '@modules/config/interfaces'

export default class ConfigService extends ParentConfigService implements IConfigService {
    public getMapBoxConfig(): IMapBoxConfig {
        return {
            token: this.env('MAPBOX_TOKEN')!,
        }
    }

    public getServerConfig(): IServerConfig {
        return {
            ...super.getServerConfig(),
            secretKey: this.env('SECRET_KEY')!,
        }
    }

    public getFirebaseProjectConfig(): IFirebaseProjectConfig {
        return {
            apiKey: this.env('FIREBASE_API_KEY')!,
            authDomain: this.env('FIREBASE_AUTH_DOMAIN')!,
            databaseURL: this.env('FIREBASE_DATABASE_URL')!,
            projectId: this.env('FIREBASE_PROJECT_ID')!,
            storageBucket: this.env('FIREBASE_STORAGE_BUCKET')!,
            messagingSenderId: this.env('FIREBASE_MESSAGING_SENDER_ID')!,
            appId: this.env('FIREBASE_APP_ID')!,
        }
    }

    public getFirebaseDLinksConfig(): IFirebaseDLinksConfig {
        return {
            passRedirectUrl: this.env('FIREBASE_DLINK_REDIRECT_PASS')!,
            domainPrefix: this.env('FIREBASE_DLINK_DOMAIN')!,
            androidPackage: this.env('FIREBASE_DLINK_ANDROID_PACKAGE')!,
            iosBundleId: this.env('FIREBASE_DLINK_IOS_BUNDLE')!,
            linkTimeout: this.env('CONFIRM_DLINK_TIMEOUT')!,
        }
    }
}
