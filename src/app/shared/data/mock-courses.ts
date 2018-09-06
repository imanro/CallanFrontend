import {CallanCourse} from '../models/course.model';

const courseData = [
    {
        id: 1,
        title: 'Callan English'
    },
    {
        id: 2,
        title: 'Business English'
    }
];

const mockCourses: CallanCourse[] = [];

for (const row of courseData ) {
    mockCourses.push(Object.assign(new CallanCourse(), row));
}


export { mockCourses };
