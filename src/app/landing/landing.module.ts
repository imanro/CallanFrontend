import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CallanLandingRoutingModule} from './landing-routing.module';
import {CallanLandingContainerComponent} from './landing-container/landing-container.component';
import { CallanFrontPageComponent } from './front-page/front-page.component';

@NgModule({
    imports: [
        CommonModule,
        CallanLandingRoutingModule,
    ],
    declarations: [
        CallanLandingContainerComponent,
        CallanFrontPageComponent
    ]
})
export class CallanLandingModule {
}
