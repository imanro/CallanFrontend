import {CallanCourse} from './callan-course.model';
import {CallanCourseStage} from './callan-course-stage.model';

export class CallanLesson {
    id: number;
    title: string;
    course: CallanCourse;
    courseStage: CallanCourseStage;
    orderInCourse: number;
    orderInStage: number;
}
