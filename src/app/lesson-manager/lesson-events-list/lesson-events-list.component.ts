import {Component, OnInit, Input, Output} from '@angular/core';
import {CallanLessonEvent} from '../../shared/models/lesson-event.model';
import {BehaviorSubject} from 'rxjs';

import {LocalDataSource} from 'ng2-smart-table';
import {DatePipe} from '@angular/common';
import {CallanLessonEventStateEnum} from '../../shared/enums/lesson-event.state.enum';

@Component({
    selector: 'app-callan-lesson-events-list',
    templateUrl: './lesson-events-list.component.html',
    styleUrls: ['./lesson-events-list.component.scss']
})
export class CallanLessonEventsListComponent implements OnInit {

    @Input() lessonEvents$ = new BehaviorSubject<CallanLessonEvent[]>([]);

    source: LocalDataSource;
    settings: any;

    constructor(
        private datePipe: DatePipe
    ) {
        const _this = this;
        this.source = new LocalDataSource();

        this.settings = {
            columns: {
                startTime: {
                    title: 'Start time',
                    filter: false,
                    valuePrepareFunction: function (value) {
                        return _this.datePipe.transform(value, 'short');
                    }
                },
                duration: {
                    title: 'Duration, min',
                    filter: false
                },
                courseProgress: {
                    title: 'Course',
                    filter: false,
                    valuePrepareFunction: function (value) {
                        console.log(value, 'ttttable');
                        return value ? value.course.title : '';
                    }
                },
                /*
                lesson: {
                    title: 'Lesson',
                    filter: false,
                    valuePrepareFunction: function (value) {
                        return value ? (value.title + (value.course ? ' (' + value.course.title + ')' : '')) : '';
                    }
                },
                */
                student: {
                    title: 'Student',
                    filter: false,
                    valuePrepareFunction: function (value) {
                        return value ? value.getFullName() : '';
                    }
                },
                teacher: {
                    title: 'Teacher',
                    filter: false,
                    valuePrepareFunction: function (value) {
                        return value ? value.getFullName() : '';
                    }
                },
                state: {
                    title: 'State',
                    filter: false,
                    valuePrepareFunction: function (value) {
                        switch (value) {
                            case (CallanLessonEventStateEnum.STARTED):
                                return 'Started';
                            case (CallanLessonEventStateEnum.COMPLETED):
                                return 'Completed';
                            default:
                                return 'Planned';
                        }
                    }
                }
            },
            hideSubHeader: true,
            actions: {
                add: false,
                edit: false,
                delete: false,
                position: 'right'
            },
            attr: {
                class: 'table table-responsive'
            },
            edit: {
                editButtonContent: '<i class="ft-edit-2 info font-medium-1 mr-2"></i>'
            },
            delete: {
                deleteButtonContent: '<i class="ft-x danger font-medium-1 mr-2"></i>'
            },
        };
    }

    ngOnInit() {
        this.lessonEvents$.subscribe(lessonEvents => {
            this.source.load(lessonEvents);
        });
    }

}
