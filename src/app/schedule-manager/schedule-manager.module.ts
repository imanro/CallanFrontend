import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';

import {CommonModule} from '@angular/common';
import {CallanScheduleManagerContainerComponent} from './schedule-manager-container.component';
import {CallanScheduleManagerRoutingModule} from './schedule-manager-routing.module';
import { CallanScheduleRangesListComponent } from './schedule-ranges-list/callan-schedule-ranges-list.component';
import { ScheduleRangeDetailsComponent } from './schedule-range-details/schedule-range-details.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CallanScheduleManagerRoutingModule
    ],
    declarations: [CallanScheduleManagerContainerComponent, CallanScheduleRangesListComponent, ScheduleRangeDetailsComponent]
})
export class CallanScheduleManagerModule {
}
