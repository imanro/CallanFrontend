import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CallanAuthRoutingModule} from './auth-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CallanLoginComponent} from './login/login.component';
import {CallanAuthContainerComponent} from './auth-container.component';

@NgModule({
    declarations: [
        CallanAuthContainerComponent,
        CallanLoginComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CallanAuthRoutingModule,
    ],
    providers: [],
})

export class CallanAuthModule {
}
