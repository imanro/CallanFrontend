import {NgModule, APP_INITIALIZER, ErrorHandler} from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from "./shared/shared.module";
import { ToastrModule } from 'ngx-toastr';
import { AgmCoreModule } from '@agm/core';
import {HttpClientModule, HttpClient, HTTP_INTERCEPTORS} from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { StoreModule } from '@ngrx/store';

import { AppComponent } from './app.component';
import { ContentLayoutComponent } from './layouts/content/content-layout.component';
import { FullLayoutComponent } from './layouts/full/full-layout.component';

import { DragulaService } from 'ng2-dragula';
import { CallanAuthService } from './shared/services/auth.service';
import { AuthGuard } from './shared/services/auth-guard.service';

import {CallanCustomerService} from './shared/services/customer.service';
import {CallanCustomerMockService} from './shared/services/customer-mock.service';
import {CallanCustomerApiService} from './shared/services/customer-api.service';
import {CallanLessonService} from './shared/services/lesson.service';
import {CallanLessonMockService} from './shared/services/lesson-mock.service';
import {AppConfig} from './app.config';
import {CalendarModule} from 'angular-calendar';

import * as $ from 'jquery';
import {CallanAuthApiService} from './shared/services/auth-api.service';
import {TokenInterceptor} from './shared/interceptors/token.interceptor';
import {CallanLessonApiService} from './shared/services/lesson-api.service';
import {AppErrorHandler} from './app-error-handler';
import {CallanScheduleMockService} from './shared/services/schedule-mock.service';
import {CallanScheduleService} from './shared/services/schedule.service';
import {CallanScheduleApiService} from './shared/services/schedule-api.service';
import {CallanActivityLogService} from './shared/services/activity-log.service';
import {CallanActivityLogMockService} from './shared/services/activity-log-mock.service';
import {CallanActivityLogApiService} from './shared/services/activity-log-api.service';
import {CallanDateApiService} from './shared/services/date-api.service';
import {CallanDateService} from './shared/services/date.service';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
  }

export function initializeApp(appConfig: AppConfig) {
    return () => {
        return appConfig.load();
    };
}

@NgModule({
    declarations: [
        AppComponent,
        FullLayoutComponent,
        ContentLayoutComponent,
    ],
    imports: [
        BrowserAnimationsModule,
        StoreModule.forRoot({}),
        AppRoutingModule,
        SharedModule,
        HttpClientModule,
        ToastrModule.forRoot(),
        NgbModule.forRoot(),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
              }
        }),
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyBr5_picK8YJK7fFR2CPzTVMj6GG1TtRGo'
        }),
        CalendarModule.forRoot()
    ],
    providers: [
        {   provide: APP_INITIALIZER,
            useFactory: initializeApp,
            deps: [AppConfig],
            multi: true
        },
        {
            provide: ErrorHandler,
            useClass: AppErrorHandler
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        },
        {provide: CallanAuthService, useClass: CallanAuthApiService},
        AuthGuard,
        DragulaService,
        AppConfig,
        // {provide: CallanCustomerService, useClass: CallanCustomerMockService},
        {provide: CallanCustomerService, useClass: CallanCustomerApiService},
        // {provide: CallanLessonService, useClass: CallanLessonMockService},
        {provide: CallanLessonService, useClass: CallanLessonApiService},
        // {provide: CallanScheduleService, useClass: CallanScheduleMockService},
        {provide: CallanScheduleService, useClass: CallanScheduleApiService},
        // {provide: CallanActivityLogService, useClass: CallanActivityLogMockService}
        {provide: CallanActivityLogService, useClass: CallanActivityLogApiService},
        {provide: CallanDateService, useClass: CallanDateApiService}
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
