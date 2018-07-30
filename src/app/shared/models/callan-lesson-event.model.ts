import {CallanLesson} from './callan-lesson.model';
import {CallanCustomer} from './callan-customer.model';

export class CallanLessonEvent {

    static readonly STATE_PLANNED = 1;

    static readonly STATE_ONGOING = 2;

    static readonly STATE_COMPLETED = 3;

    id: number;
    title: string;
    lesson: CallanLesson;
    teacher: CallanCustomer;
    student: CallanCustomer;
    startTime: Date;
    duration: number;
    state: number;
}
