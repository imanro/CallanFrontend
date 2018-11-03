import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import {ReactiveFormsModule} from '@angular/forms';

import {CallanLessonManagerRoutingModule} from './lesson-manager-routing.module';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CalendarModule} from 'angular-calendar';
import {CalendarWeekHoursViewModule} from '@imanro/angular-calendar-week-hours-view';

import {CallanLessonManagerStudentContainerComponent} from './lesson-manager-student-container.component';
import {CallanCoursesListComponent} from './courses-list/courses-list.component';
import {CallanCourseProgressDetailsComponent} from './course-progress-details/course-progress-details.component';
import { CallanLessonEventsCalendarComponent } from './lesson-events-calendar/lesson-events-calendar.component';
import { CallanLessonEventComponent } from './lesson-event/lesson-event.component';
import { CallanLessonEventsListComponent } from './lesson-events-list/lesson-events-list.component';
import { CallanCustomerCourseAddComponent } from './customer-course-add/customer-course-add.component';
import { LessonEventsBalanceDetailsComponent } from './lesson-events-balance-details/lesson-events-balance-details.component';

@NgModule({
    declarations: [CallanLessonManagerStudentContainerComponent,
        CallanCoursesListComponent,
        CallanCourseProgressDetailsComponent,
        CallanLessonEventsCalendarComponent,
        CallanLessonEventComponent,
        CallanLessonEventsListComponent,
        CallanCustomerCourseAddComponent,
        LessonEventsBalanceDetailsComponent
    ],
    imports: [
        CommonModule,
        Ng2SmartTableModule,
        CallanLessonManagerRoutingModule,
        NgbModule,
        ReactiveFormsModule,
        CalendarModule.forRoot(),
        CalendarWeekHoursViewModule,
    ],
})
export class CallanLessonManagerModule {
}
