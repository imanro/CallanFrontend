import {CallanCustomer} from './customer.model';
import {CallanCourse} from './course.model';
import {CallanLessonEvent} from './lesson-event.model';

export class CallanCourseProgress {
    id: number;
    customer: CallanCustomer;
    course: CallanCourse;
    lastLessonEvent?: CallanLessonEvent;
    completedLessonEventsCount: number;
}
