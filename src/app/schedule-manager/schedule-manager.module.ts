import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';

import {CommonModule} from '@angular/common';
import {CallanScheduleManagerContainerComponent} from './schedule-manager-container.component';
import {CallanScheduleManagerRoutingModule} from './schedule-manager-routing.module';
import { CallanScheduleRangesListComponent } from './schedule-ranges-list/schedule-ranges-list.component';
import { ScheduleRangeDetailsComponent } from './schedule-range-details/schedule-range-details.component';
import {AppPipesModule} from '../shared-modules/pipes/pipes.module';
import {NgbModalModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { CallanScheduleRangeViewComponent } from './schedule-ranges-list/schedule-range-view/schedule-range-view.component';
import {AppModalContentModule} from '../shared-modules/modal-content/modal-content.module';
import {AppModalContentComponent} from '../shared-modules/modal-content/modal-content.component';
import { CallanScheduleRangeCalendarComponent } from './schedule-range-calendar/schedule-range-calendar.component';
import {CalendarModule} from 'angular-calendar';
import {CalendarWeekHoursViewModule} from '@imanro/angular-calendar-week-hours-view';
import {CallanNavTabsModule} from '../shared-modules/nav-tabs/nav-tabs.module';

@NgModule({
    imports: [
        CommonModule,
        AppPipesModule,
        NgbModule,
        ReactiveFormsModule,
        CallanScheduleManagerRoutingModule,
        NgbModalModule,
        AppModalContentModule,
        CalendarModule,
        CalendarWeekHoursViewModule,
        CallanNavTabsModule
    ],
    declarations: [
        CallanScheduleManagerContainerComponent,
        CallanScheduleRangesListComponent,
        ScheduleRangeDetailsComponent,
        CallanScheduleRangeViewComponent,
        CallanScheduleRangeCalendarComponent
    ],
    entryComponents: [AppModalContentComponent],
})
export class CallanScheduleManagerModule {
}
