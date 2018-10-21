import {CallanBaseModel} from './base.model';
import {CallanLesson} from './lesson.model';
import {CallanCustomer} from './customer.model';
import {CallanLessonEventStateEnum} from '../enums/lesson-event.state.enum';

export class CallanLessonEvent extends CallanBaseModel {

    id: number;
    title: string;
    lesson: CallanLesson;
    teacher: CallanCustomer;
    student: CallanCustomer;
    startTime: Date;
    duration: number;
    state: number;

    isStarted?() {
        return this.state === CallanLessonEventStateEnum.STARTED;
    }
}
