import { InjectionToken } from '@angular/core';

export let AppConfig = new InjectionToken('app.config');

export interface IAppConfig {
    mockDelayMs: number;
    apiProtocol: string;
    apiUrlHost:  string;
    apiUrlPrefix: string;
    checkNearestLessonEventIntervalSec: number;
    checkCurrentLessonEventStartTimeIntervalSec: number;
}

export const _appConfig: IAppConfig = {
    mockDelayMs: 1000,
    apiProtocol: 'http',
    apiUrlHost: '',
    apiUrlPrefix: '',
    checkNearestLessonEventIntervalSec: 60000,
    checkCurrentLessonEventStartTimeIntervalSec: 60000
};
