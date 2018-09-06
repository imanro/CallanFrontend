import {CallanCourse} from './course.model';
import {CallanCourseStage} from './course-stage.model';

export class CallanLesson {
    id: number;
    title: string;
    course: CallanCourse;
    courseStage: CallanCourseStage;
    orderInCourse: number;
    orderInStage: number;
}
