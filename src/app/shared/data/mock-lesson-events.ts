import {CallanLessonEvent} from '../models/lesson-event.model';

import {mockLessons} from './mock-lessons';


const lesson1 = mockLessons[1];
const lesson2 = mockLessons[2];
const lesson3 = mockLessons[3];

const currentDate = new Date();

const mockLessonEvents = [];

const baseStartDate = new Date();
baseStartDate.setHours(currentDate.getHours());
baseStartDate.setMinutes(5);
baseStartDate.setSeconds(0);

// 1st lesson event
const event1 = new CallanLessonEvent();

event1.title = 'Lesson 1';
event1.startTime = baseStartDate;
event1.lesson = lesson1;

// 2nd lesson
const event2StartDate = new Date(baseStartDate.getTime());
event2StartDate.setDate(baseStartDate.getDate() + 1);
event2StartDate.setHours(13);


const event2 = new CallanLessonEvent();
event2.title = 'Lesson 2';
event2.startTime = event2StartDate;
event2.lesson = lesson2;

// 3rd lesson
const event3StartDate = new Date(baseStartDate.getTime());
event3StartDate.setDate(baseStartDate.getDate() + 1);
event3StartDate.setHours(event2StartDate.getHours() + 1);

const event3 = new CallanLessonEvent();
event3.title = 'Lesson 3';
event3.startTime = event3StartDate;
event3.lesson = lesson3;

// mockLessonEvents.push(event1);
mockLessonEvents.push(event1);
mockLessonEvents.push(event2);
mockLessonEvents.push(event3);

export {mockLessonEvents};
