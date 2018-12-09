import {CallanBaseModel} from './base.model';

export class CallanCourse extends CallanBaseModel {
    id: number;
    title: string;
    teacherChoice: number;
}
