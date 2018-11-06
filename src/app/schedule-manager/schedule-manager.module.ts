import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';

import {CommonModule} from '@angular/common';
import {CallanScheduleManagerContainerComponent} from './schedule-manager-container.component';
import {CallanScheduleManagerRoutingModule} from './schedule-manager-routing.module';
import { CallanScheduleRangesListComponent } from './schedule-ranges-list/callan-schedule-ranges-list.component';
import { ScheduleRangeDetailsComponent } from './schedule-range-details/schedule-range-details.component';
import {AppPipesModule} from '../core/pipes/pipes.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    imports: [
        CommonModule,
        AppPipesModule,
        ReactiveFormsModule,
        CallanScheduleManagerRoutingModule,
        NgbModule
    ],
    declarations: [CallanScheduleManagerContainerComponent, CallanScheduleRangesListComponent, ScheduleRangeDetailsComponent]
})
export class CallanScheduleManagerModule {
}
