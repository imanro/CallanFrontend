import {CallanBaseModel} from './base.model';
import {CallanCourse} from './course.model';
import {CallanCourseStage} from './course-stage.model';

export class CallanLesson extends CallanBaseModel {
    id: number;
    title: string;
    course: CallanCourse;
    courseStage: CallanCourseStage;
    orderInCourse: number;
    orderInStage: number;
}
