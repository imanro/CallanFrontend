import {CallanCourseProgress} from '../models/course-progress.model';
import {CallanCustomer} from '../models/customer.model';
import {CallanLessonEvent} from '../models/lesson-event.model';

import {mockCourses} from './mock-courses';
import {mockLessons} from './mock-lessons';

// customers
const customer1 = new CallanCustomer();
customer1.id = 2;
customer1.email = 'roman.denisov@biscience.com';
customer1.firstName = 'Roman';
customer1.lastName = 'Denisov';

const customer2 = new CallanCustomer();
customer2.id = 3;
customer2.email = 'tertia@gmail.com';
customer2.firstName = 'Tertia';
customer2.lastName = 'Fourtie';


// courses
const courseCallan = mockCourses[0];
const courseBusinessEnglish = mockCourses[1];


const lastLessonEvent1 = new CallanLessonEvent();
lastLessonEvent1.lesson = mockLessons[0];
lastLessonEvent1.duration = 1200;
lastLessonEvent1.startTime = new Date();
lastLessonEvent1.student = customer1;
lastLessonEvent1.teacher = customer2;

const lastLessonEvent2 = new CallanLessonEvent();
lastLessonEvent1.lesson = mockLessons[1];
lastLessonEvent1.duration = 3600;
lastLessonEvent1.startTime = new Date();
lastLessonEvent1.student = customer2;
lastLessonEvent1.teacher = customer1;

const courseProgressData = [
    {
        id: 1,
        customer: customer1,
        course: courseCallan,
        lastLessonEvent: lastLessonEvent1,
        completedLessonEventsCount: 2
    },
    {
        id: 2,
        customer: customer2,
        course: courseCallan,
        lastLessonEvent: lastLessonEvent2,
        completedLessonEventsCount: 34
    },
    {
        id: 3,
        customer: customer2,
        course: courseBusinessEnglish,
        completedLessonEventsCount: 19
    }
];

const mockProgresses: CallanCourseProgress[] = [];

for (const row of courseProgressData) {
    mockProgresses.push(Object.assign(new CallanCourseProgress(), row));
}

export { mockProgresses };
