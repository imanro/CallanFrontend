
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from "./shared/shared.module";
import { ToastrModule } from 'ngx-toastr';
import { AgmCoreModule } from '@agm/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { StoreModule } from '@ngrx/store';

import { AppComponent } from './app.component';
import { ContentLayoutComponent } from "./layouts/content/content-layout.component";
import { FullLayoutComponent } from "./layouts/full/full-layout.component";

import { DragulaService } from 'ng2-dragula';
import { AuthService } from './shared/auth/auth.service';
import { AuthGuard } from './shared/auth/auth-guard.service';

import {CallanCustomerService} from './shared/services/customer.service';
import {CallanCustomerMockService} from './shared/services/customer-mock.service';
import {CallanLessonService} from './shared/services/lesson.service';
import {CallanLessonMockService} from './shared/services/lesson-mock.service';
import {_appConfig, AppConfig} from './app.config';
import {CalendarModule} from 'angular-calendar';

import * as $ from 'jquery';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
  }

@NgModule({
    declarations: [
        AppComponent,
        FullLayoutComponent,
        ContentLayoutComponent
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
        AuthService,
        AuthGuard,
        DragulaService,
        {provide: CallanCustomerService, useClass: CallanCustomerMockService},
        {provide: CallanLessonService, useClass: CallanLessonMockService},
        {
            provide: AppConfig,
            useValue: _appConfig
        },
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
