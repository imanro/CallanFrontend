import {CallanBaseModel} from './base.model';
import {CallanCourse} from './course.model';
import {CallanCustomer} from './customer.model';

export class CallanCourseCompetence extends CallanBaseModel {
    id: number;
    course: CallanCourse;
    customer: CallanCustomer;
}
