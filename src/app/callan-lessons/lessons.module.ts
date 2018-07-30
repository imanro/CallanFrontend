import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CallanLessonsRoutingModule} from './lessons-routing.module';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CalendarModule} from 'angular-calendar';
import {CalendarWeekHoursViewModule} from '@imanro/angular-calendar-week-hours-view';

import {CallanLessonsComponent} from './lessons.component';
import {CallanCoursesListComponent} from './courses-list/courses-list.component';
import {CallanCourseProgressDetailsComponent} from './course-progress-details/course-progress-details.component';
import { CallanLessonEventDetailsComponent } from './lesson-event-details/lesson-event-details.component';
import { CallanLessonEventsListComponent } from './lesson-events-list/lesson-events-list.component';

@NgModule({
    declarations: [CallanLessonsComponent, CallanCoursesListComponent, CallanCourseProgressDetailsComponent,
        CallanLessonEventDetailsComponent, CallanLessonEventsListComponent],
    imports: [
        CommonModule,
        CallanLessonsRoutingModule,
        NgbModule,
        CalendarModule.forRoot(),
        CalendarWeekHoursViewModule,
    ],
})
export class CallanLessonsModule {
}
