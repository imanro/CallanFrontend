import {CallanCourseProgress} from '../models/callan-course-progress.model';
import {CallanCustomer} from '../models/callan-customer.model';
import {CallanCourse} from '../models/callan-course.model';
import {CallanLesson} from '../models/callan-lesson.model';
import {CallanCourseStage} from '../models/callan-course-stage.model';
import {CallanLessonEvent} from '../models/callan-lesson-event.model';

// customers
const customer1 = new CallanCustomer();
customer1.id = 2;
customer1.email = 'roman.denisov@biscience.com';

const customer2 = new CallanCustomer();
customer2.id = 3;
customer2.email = 'tertia@gmail.com';

// courses
const courseCallan = new CallanCourse();
courseCallan.id = 1;
courseCallan.title = 'Callan';

const courseBusinessEnglish = new CallanCourse();
courseBusinessEnglish.id = 2;
courseBusinessEnglish.title = 'Business English';

// stages
const stageCallan1 = new CallanCourseStage();
stageCallan1.order = 2;
stageCallan1.title = 'Stage 2';

const stageCallan2 = new CallanCourseStage();
stageCallan1.order = 4;
stageCallan2.title = 'Stage 4';

const stageBusinessEnglish1 = new CallanCourseStage();
stageBusinessEnglish1.order = 4;
stageBusinessEnglish1.title = 'At office';

// lessons
const lessonBusinessEnglish1 = new CallanLesson();
lessonBusinessEnglish1.title = 'Nogotiations';
lessonBusinessEnglish1.courseStage = stageBusinessEnglish1;
lessonBusinessEnglish1.orderInCourse = 20;
lessonBusinessEnglish1.orderInStage = 2;

const lessonCallan1 = new CallanLesson();
lessonCallan1.title = 'Present Continues';
lessonCallan1.courseStage = stageCallan1;
lessonCallan1.orderInCourse = 25;
lessonCallan1.orderInStage = 2;


const lessonCallan2 = new CallanLesson();
lessonCallan2.title = 'Irregular Verbs';
lessonCallan2.courseStage = stageCallan2;
lessonCallan2.orderInCourse = 45;
lessonCallan2.orderInStage = 3;

const lastLessonEvent1 = new CallanLessonEvent();
lastLessonEvent1.lesson = lessonCallan1;
lastLessonEvent1.duration = 1200;
lastLessonEvent1.startTime = new Date();
lastLessonEvent1.student = customer1;
lastLessonEvent1.teacher = customer2;

const lastLessonEvent2 = new CallanLessonEvent();
lastLessonEvent1.lesson = lessonCallan2;
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

const mockProgresses: { [id: number]: CallanCourseProgress } = {};

for (const row of courseProgressData) {
    mockProgresses[row.id] = Object.assign(new CallanCourseProgress(), row);
}

export { mockProgresses };
