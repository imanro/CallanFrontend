import { InjectionToken } from '@angular/core';

export let AppConfig = new InjectionToken('app.config');

export interface IAppConfig {
    mockDelayMs: number;
    apiProtocol: string;
    apiUrlHost:  string;
    apiUrlPrefix: string;
}

export const _appConfig: IAppConfig = {
    mockDelayMs: 1000,
    apiProtocol: 'http',
    apiUrlHost: '',
    apiUrlPrefix: ''
};
