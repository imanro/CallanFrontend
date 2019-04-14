import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {ReactiveFormsModule} from '@angular/forms';

import {CallanLessonManagerRoutingModule} from './lesson-manager-routing.module';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CalendarModule} from 'angular-calendar';
import {CalendarWeekHoursViewModule} from '@imanro/angular-calendar-week-hours-view';
import {CallanLessonManagerStudentContainerComponent} from './lesson-manager-student-container.component';
import { CallanLessonManagerTeacherContainerComponent } from './lesson-manager-teacher-container.component';
import {CallanCoursesListComponent} from './courses-list/courses-list.component';
import {CallanCourseProgressDetailsComponent} from './course-progress-details/course-progress-details.component';
import {CallanLessonEventsStudentCalendarComponent} from './lesson-events-student-calendar/lesson-events-student-calendar.component';
import {CallanLessonEventsTeacherCalendarComponent} from './lesson-events-teacher-calendar/lesson-events-teacher-calendar.component';
import {CallanLessonEventComponent} from './lesson-event/lesson-event.component';
import {CallanLessonEventsListComponent} from './lesson-events-list/lesson-events-list.component';
import {CallanCustomerCourseAddComponent} from './customer-course-add/customer-course-add.component';
import {CallanBalanceDetailsComponent} from './balance-details/balance-details.component';
import {AppModalContentModule} from '../shared-modules/modal-content/modal-content.module';
import {AppModalContentLessonEventCreate} from '../shared-modules/modal-content-lesson-event-create/modal-content-lesson-event-create.module';
import {AppModalContentLessonEventCreateComponent} from '../shared-modules/modal-content-lesson-event-create/modal-content-lesson-event-create.component';
import {AppModalContentComponent} from '../shared-modules/modal-content/modal-content.component';
import {AppModalContentFeedbackModule} from '../shared-modules/modal-content-feedback/modal-content-feedback.module';
import {AppModalContentFeedbackComponent} from '../shared-modules/modal-content-feedback/modal-content-feedback.component';
import { CallanCourseCompetencesForCustomerListComponent } from './course-competences-for-customer-list/course-competences-for-customer-list.component';
import { CallanCourseSpecialityAddComponent } from './course-competence-add/course-competence-add.component';
import { CallanCourseCompetencesForCourseListComponent } from './course-competences-for-course-list/course-competences-for-course-list.component';
import {CallanCustomerHeaderModule} from '../shared-modules/customer-header/customer-header.module';
import {CallanNavTabsModule} from '../shared-modules/nav-tabs/nav-tabs.module';
import {FlexLayoutModule} from '@angular/flex-layout';

@NgModule({
    declarations: [
        CallanLessonManagerStudentContainerComponent,
        CallanLessonManagerTeacherContainerComponent,
        CallanCoursesListComponent,
        CallanCourseProgressDetailsComponent,
        CallanLessonEventsStudentCalendarComponent,
        CallanLessonEventsTeacherCalendarComponent,
        CallanLessonEventComponent,
        CallanLessonEventsListComponent,
        CallanCustomerCourseAddComponent,
        CallanBalanceDetailsComponent,
        CallanCourseCompetencesForCustomerListComponent,
        CallanCourseSpecialityAddComponent,
        CallanCourseCompetencesForCourseListComponent
    ],
    imports: [
        CommonModule,
        NgxDatatableModule,
        CallanLessonManagerRoutingModule,
        NgbModule,
        ReactiveFormsModule,
        CalendarModule.forRoot(),
        CalendarWeekHoursViewModule,
        CallanCustomerHeaderModule,
        CallanNavTabsModule,
        AppModalContentModule,
        AppModalContentLessonEventCreate,
        AppModalContentFeedbackModule,
        FlexLayoutModule
    ],
    entryComponents: [AppModalContentComponent, AppModalContentFeedbackComponent, AppModalContentLessonEventCreateComponent],
})
export class CallanLessonManagerModule {
}
