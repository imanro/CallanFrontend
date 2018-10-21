import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import {CallanLessonManagerRoutingModule} from './lesson-manager-routing.module';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CalendarModule} from 'angular-calendar';
import {CalendarWeekHoursViewModule} from '@imanro/angular-calendar-week-hours-view';

import {CallanLessonManagerContainerComponent} from './lesson-manager-container.component';
import {CallanCoursesListComponent} from './courses-list/courses-list.component';
import {CallanCourseProgressDetailsComponent} from './course-progress-details/course-progress-details.component';
import { CallanLessonEventsCalendarComponent } from './lesson-events-calendar/lesson-events-calendar.component';
import { CallanLessonEventComponent } from './lesson-event/lesson-event.component';
import { CallanLessonEventAnnouncementComponent } from './lesson-event-announcement/lesson-event-announcement.component';
import { CallanLessonEventsListComponent } from './lesson-events-list/lesson-events-list.component';

@NgModule({
    declarations: [CallanLessonManagerContainerComponent,
        CallanCoursesListComponent,
        CallanCourseProgressDetailsComponent,
        CallanLessonEventsCalendarComponent,
        CallanLessonEventComponent,
        CallanLessonEventAnnouncementComponent,
        CallanLessonEventsListComponent
    ],
    imports: [
        CommonModule,
        Ng2SmartTableModule,
        CallanLessonManagerRoutingModule,
        NgbModule,
        CalendarModule.forRoot(),
        CalendarWeekHoursViewModule,
    ],
})
export class CallanLessonManagerModule {
}
