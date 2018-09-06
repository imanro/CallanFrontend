import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CallanLessonManagerRoutingModule} from './lesson-manager-routing.module';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CalendarModule} from 'angular-calendar';
import {CalendarWeekHoursViewModule} from '@imanro/angular-calendar-week-hours-view';

import {CallanLessonManagerContainerComponent} from './lesson-manager-container.component';
import {CallanCoursesListComponent} from './courses-list/courses-list.component';
import {CallanCourseProgressDetailsComponent} from './course-progress-details/course-progress-details.component';
import { CallanLessonEventsCalendarComponent } from './lesson-events-calendar/lesson-events-calendar.component';
import { CallanLessonEventComponent } from './lesson-event/lesson-event.component';

@NgModule({
    declarations: [CallanLessonManagerContainerComponent,
        CallanCoursesListComponent,
        CallanCourseProgressDetailsComponent,
        CallanLessonEventsCalendarComponent,
        CallanLessonEventComponent
    ],
    imports: [
        CommonModule,
        CallanLessonManagerRoutingModule,
        NgbModule,
        CalendarModule.forRoot(),
        CalendarWeekHoursViewModule,
    ],
})
export class CallanLessonManagerModule {
}
