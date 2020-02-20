import {
    IConfigService as IParentConfigService,
    IServerConfig as IParentServerConfig
} from '@bibtrip/config'

export interface IConfigService extends IParentConfigService {
    getServerConfig(): IServerConfig
    getMapBoxConfig(): IMapBoxConfig
    getFirebaseProjectConfig(): IFirebaseProjectConfig
    getFirebaseDLinksConfig(): IFirebaseDLinksConfig
}

export interface IServerConfig extends IParentServerConfig {
    secretKey: string
}

export interface IMapBoxConfig {
    token: string
}

export interface IFirebaseProjectConfig {
    apiKey: string
    authDomain: string
    databaseURL: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
}

export interface IFirebaseDLinksConfig {
    passRedirectUrl: string
    domainPrefix: string
    androidPackage: string
    iosBundleId: string
    linkTimeout: number
}
