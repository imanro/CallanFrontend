import {CallanCustomer} from './callan-customer.model';
import {CallanCourse} from './callan-course.model';
import {CallanLessonEvent} from './callan-lesson-event.model';

export class CallanCourseProgress {
    id: number;
    customer: CallanCustomer;
    course: CallanCourse;
    lastLessonEvent?: CallanLessonEvent;
    completedLessonEventsCount: number;
}
