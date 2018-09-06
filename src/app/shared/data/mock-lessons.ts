import {CallanLesson} from '../models/lesson.model';
import {CallanCourseStage} from '../models/course-stage.model';

import {mockCourses} from './mock-courses';

// courses
const courseCallan = mockCourses[0];
const courseBusinessEnglish = mockCourses[1];

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
lessonBusinessEnglish1.course = courseBusinessEnglish;

const lessonCallan1 = new CallanLesson();
lessonCallan1.title = 'Present Continues';
lessonCallan1.courseStage = stageCallan1;
lessonCallan1.orderInCourse = 25;
lessonCallan1.orderInStage = 2;
lessonCallan1.course = courseCallan;


const lessonCallan2 = new CallanLesson();
lessonCallan2.title = 'Irregular Verbs';
lessonCallan2.courseStage = stageCallan2;
lessonCallan2.orderInCourse = 45;
lessonCallan2.orderInStage = 3;
lessonCallan2.course = courseCallan;

const mockLessons: CallanLesson[] = [];

mockLessons.push(lessonBusinessEnglish1);
mockLessons.push(lessonCallan1);
mockLessons.push(lessonCallan2);

export {mockLessons};
