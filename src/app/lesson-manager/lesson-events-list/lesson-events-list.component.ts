import {Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import {CallanLessonEvent} from '../../shared/models/lesson-event.model';
import {BehaviorSubject, Subject} from 'rxjs';

import {LocalDataSource} from 'ng2-smart-table';
import {DatePipe} from '@angular/common';
import {CallanLessonEventStateEnum} from '../../shared/enums/lesson-event.state.enum';
import {CallanLessonService} from '../../shared/services/lesson.service';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-callan-lesson-events-list',
    templateUrl: './lesson-events-list.component.html',
    styleUrls: ['./lesson-events-list.component.scss']
})
export class CallanLessonEventsListComponent implements OnInit, OnDestroy {

    @Input() lessonEvents: CallanLessonEvent[];

    @Input() refresh$ = new Subject<void>();

    @Output() setCurrentLessonEventEvent = new EventEmitter<CallanLessonEvent>();

    source: LocalDataSource;
    settings: any;

    private unsubscribe$: Subject<void> = new Subject();

    constructor(
        private datePipe: DatePipe
    ) {
        this.source = new LocalDataSource();
        this.buildTable();
    }

    ngOnInit() {
        console.log('LE:', this.lessonEvents);
        // not load twice
        this.loadTableData();
        this.subscribeOnRefresh();
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    handleCustomAction($e) {
        switch ($e.action) {
            case('setCurrentLessonEvent'):
                this.setCurrentLessonEventEvent.next($e.data);
                break;
            default:
                break;
        }
    }

    private buildTable() {
        const _this = this;

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
                        return CallanLessonService.getLessonEventStateName(value);
                    }
                }
            },
            hideSubHeader: true,
            attr: {
                class: 'table table-responsive'
            },
            actions: {
                custom: [
                    {
                        name: 'setCurrentLessonEvent',
                        title: '<i class="ft-eye success font-medium-1 mr-2" title="View lesson event"></i>',
                    },
                ],
                add: false,
                edit: false,
                delete: false,
                position: 'right'
            },
            edit: {
                editButtonContent: '<i class="ft-edit-2 info font-medium-1 mr-2"></i>'
            },
            delete: {
                deleteButtonContent: '<i class="ft-x danger font-medium-1 mr-2"></i>'
            },
        };
    }

    private loadTableData() {
        if (this.lessonEvents) {
            this.source.load(this.lessonEvents);
        }
    }

    private subscribeOnRefresh() {
        console.log('sor');
        this.refresh$.pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(() => {
            console.log(this.lessonEvents);
            console.log('loaddd');
            this.loadTableData();
        });
    }
}
