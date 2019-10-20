import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    TemplateRef,
    OnChanges, SimpleChanges
} from '@angular/core';
import {CallanLessonEvent} from '../../shared/models/lesson-event.model';
import {Observable, Subject} from 'rxjs';
import {CallanLessonEventStateEnum} from '../../shared/enums/lesson-event.state.enum';
import {CallanLessonService} from '../../shared/services/lesson.service';
import {CallanCustomer} from '../../shared/models/customer.model';
import {debounceTime, distinctUntilChanged, mergeMap} from 'rxjs/operators';
import {FormControl} from '@angular/forms';

@Component({
    selector: 'app-callan-lesson-events-list',
    templateUrl: './lesson-events-list.component.html',
    styleUrls: ['./lesson-events-list.component.scss']
})
export class CallanLessonEventsListComponent implements OnInit, OnChanges {

    @Input() lessonEvents: CallanLessonEvent[];

    @Input() isLessonEditingShown = false;

    @Input() listRowsLimit: number;

    @Input() isFilterRowShown = true;

    @Input() studentList$: Subject<CallanCustomer[]>;

    @Input() filterByStudentValue: CallanCustomer;

    @Output() setCurrentLessonEventEvent = new EventEmitter<CallanLessonEvent>();

    @Output() cancelLessonEventEvent = new EventEmitter<CallanLessonEvent>();

    @Output() studentSearchEvent = new EventEmitter<string>();

    @Output() filterByStudentEvent = new EventEmitter<CallanCustomer>();

    @ViewChild('columnStartTimeTpl') columnStartTimeTpl: TemplateRef<any>;

    @ViewChild('columnCourseTpl') columnCourseTpl: TemplateRef<any>;

    @ViewChild('columnCustomerTpl') columnCustomerTpl: TemplateRef<any>;

    @ViewChild('columnStateTpl') columnStateTpl: TemplateRef<any>;

    @ViewChild('columnActionsTpl') columnActionsTpl: TemplateRef<any>;

    columns: any;

    lessonEventStateEnum: any;

    studentFilterInput: FormControl;

    currentDate: Date;

    customerFormatter: any;

    studentSearch: any;

    constructor(
    ) {
        this.lessonEventStateEnum = CallanLessonEventStateEnum;
    }

    ngOnInit() {
        this.buildTable();
        // not load twice
        this.setCurrentDate();
        this.assignCustomerFormatter();
        this.assignStudentSearch();
        this.buildFilterInputs();
        this.setFilterInputValues();
        // this.set
    }

    ngOnChanges(changes: SimpleChanges) {
        console.log('chan');
        if (changes.filterByStudentValue !== undefined ) {
            this.setFilterInputValues();
        }
    }

    formatState(value) {
        return CallanLessonService.getLessonEventStateName(value);
    }

    formatCustomerName(customer: CallanCustomer) {
        if (customer) {
            return customer.getFullName();
        }
    }

    formatCustomerInfo(customer: CallanCustomer) {
        if (customer) {
            return customer.getFullName() + ' <' + customer.email + '>';
        }
    }

    handleRowActivate(event) {
        if (event.type === 'click' && (!event.column || event.column.prop !== 'actions')) {
            this.setCurrentLessonEventEvent.next(event.row);
        }
    }

    handleCancelLessonEvent(lessonEvent: CallanLessonEvent) {
        this.cancelLessonEventEvent.next(lessonEvent);
    }

    handleSetCurrentLessonEvent(lessonEvent: CallanLessonEvent) {
        console.log('lessonEvent', lessonEvent);
        this.setCurrentLessonEventEvent.next(lessonEvent);
    }

    handleStudentSelect($event) {
        console.log('sel');
        this.filterByStudentEvent.next($event.item);
    }

    private buildTable() {

        this.columns = [
            {
                prop: 'startTime',
                name: 'Start Time',
                cellTemplate: this.columnStartTimeTpl,
                flexGrow: 3
            },
            {
                prop: 'duration',
                name: 'Duration, min',
                sortable: false,
                flexGrow: 1
            },
            {
                prop: 'courseProgress',
                name: 'Course',
                cellTemplate: this.columnCourseTpl,
                flexGrow: 3
            },
            {
                prop: 'student',
                name: 'Student',
                sortable: false,
                cellTemplate: this.columnCustomerTpl,
                flexGrow: 3
            },
            {
                prop: 'teacher',
                name: 'Teacher',
                sortable: false,
                cellTemplate: this.columnCustomerTpl,
                flexGrow: 3
            },
            {
                prop: 'state',
                name: 'State',
                cellTemplate: this.columnStateTpl,
                flexGrow: 1
            },
            {
                prop: 'actions',
                name: '',
                cellTemplate: this.columnActionsTpl,
                cellClass: 'cell-actions',
                flexGrow: 1
            }
        ];
    }

    private assignCustomerFormatter() {
        this.customerFormatter = (x: CallanCustomer) => {
            if (x && x instanceof CallanCustomer) {
                return x.getFullName() + ' <' + x.email + '>';
            } else {
                return '';
            }
        };
    }

    private assignStudentSearch() {

        this.studentSearch = (text$: Observable<string>) =>
            text$.pipe(
                debounceTime(300),
                distinctUntilChanged(),
                mergeMap<string, any>(term => {

                    this.filterByStudentEvent.next(null);

                    if (term.length >= 2) {
                        // emit search to container
                        this.studentSearchEvent.next(term);

                        // return subscription on affected
                        return this.studentList$;
                    } else {
                        return [];
                    }
                })
            )
    }

    private buildFilterInputs() {
        console.log('build in');
        this.studentFilterInput = new FormControl('iii');
    }

    private setCurrentDate() {
        this.currentDate = new Date();
    }

    private setFilterInputValues() {
        if (this.studentFilterInput && this.filterByStudentValue) {
            console.log('setting value', this.filterByStudentValue.email);
            this.studentFilterInput.patchValue(this.filterByStudentValue, {emitEvent: false});
        }
    }
}
