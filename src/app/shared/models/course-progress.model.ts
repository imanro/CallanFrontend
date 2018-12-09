import {CallanCustomer} from './customer.model';
import {CallanCourse} from './course.model';
import {CallanLessonEvent} from './lesson-event.model';
import {CallanBaseModel} from './base.model';

export class CallanCourseProgress extends CallanBaseModel {
    id: number;
    customer: CallanCustomer;
    course: CallanCourse;
    lastLessonEvent?: CallanLessonEvent;
    completedLessonEventsCount: number;
    lessonEventsBalance: number;
    primaryTeacher: CallanCustomer;
}
