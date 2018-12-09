import {mockCourses} from './mock-courses';
import {mockCustomers} from './mock-customers';
import {CallanCourseCompetence} from '../models/course-competence.model';

const mockCourseCompetences = [];

const courseCompetence = new CallanCourseCompetence();
courseCompetence.id = 1;
courseCompetence.customer = mockCustomers[1];
courseCompetence.course = mockCourses[1];

mockCourseCompetences.push(courseCompetence);

export { mockCourseCompetences };
