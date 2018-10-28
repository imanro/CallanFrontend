import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {CallanLessonEvent} from '../models/lesson-event.model';

@Component({
  selector: 'app-callan-lesson-event-announcement',
  templateUrl: './lesson-event-announcement.component.html',
  styleUrls: ['./lesson-event-announcement.component.scss']
})
export class CallanLessonEventAnnouncementComponent implements OnInit {

    @Input() lessonEventRemainingMinutes: number;
    @Input() isLessonTimeSpent = false;
    @Input() lessonEvent: CallanLessonEvent;

    @Output() lessonStartEvent = new EventEmitter<void>();
    @Output() lessonViewEvent = new EventEmitter<void>();

    lessonEventRemainingDays = 0;
    lessonEventRemainingHours = 0;

    constructor() { }

  ngOnInit() {

        console.log('aa?');

      this.lessonEventRemainingDays = Math.floor(this.lessonEventRemainingMinutes / 60 / 24);
      if (this.lessonEventRemainingDays > 0) {
          console.log('this case');
          this.lessonEventRemainingHours = Math.floor(this.lessonEventRemainingMinutes / 60 % 24);
      } else {
          this.lessonEventRemainingHours = Math.floor(this.lessonEventRemainingMinutes / 60 );
      }

      console.log('DHM', this.lessonEventRemainingDays, this.lessonEventRemainingHours, this.lessonEventRemainingMinutes);
  }

    handleLessonEventStart() {
        this.lessonStartEvent.next();
    }

    handleLessonEventView() {
        this.lessonViewEvent.next();
    }

}
