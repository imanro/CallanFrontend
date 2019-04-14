import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {CallanActivityLog} from '../../shared/models/activity-log.model';
import {FormControl} from '@angular/forms';
import {debounceTime, distinctUntilChanged, map, mergeMap} from 'rxjs/operators';
import {CallanActivityLogService} from '../../shared/services/activity-log.service';
import {CallanActivityLogItemKindEnum} from '../../shared/enums/activity-log.item-kind.enum';
import {CallanCustomerService} from '../../shared/services/customer.service';
import {Observable, Subject, throwError} from 'rxjs';
import {CallanCustomer} from '../../shared/models/customer.model';
import {CallanLessonService} from '../../shared/services/lesson.service';
import {CallanCourseProgress} from '../../shared/models/course-progress.model';
import {CallanLessonEvent} from '../../shared/models/lesson-event.model';
import {formatDate} from '@angular/common';
import {CallanDateService} from '../../shared/services/date.service';

@Component({
    selector: 'app-activity-log-list',
    templateUrl: './activity-log-list.component.html',
    styleUrls: ['./activity-log-list.component.scss']
})
export class CallanActivityLogListComponent implements OnInit {

    @Input() rows: CallanActivityLog[];

    @Input() count: number;

    @Input() limit = 10;

    @Input() pageOffset = 0;

    @Input() affectedList$ = new Subject<CallanCustomer[]>();

    @Input() initiatorList$ = new Subject<CallanCustomer[]>();

    @Output() filterByMessageEvent = new EventEmitter<string>();

    @Output() filterByAffectedEvent = new EventEmitter<CallanCustomer>();

    @Output() filterByInitiatorEvent = new EventEmitter<CallanCustomer>();

    @Output() affectedSearchEvent = new EventEmitter<string>();

    @Output() initiatorSearchEvent = new EventEmitter<string>();

    @Output() setPageEvent = new EventEmitter<number>();

    messageFilterInput: FormControl;

    affectedFilterInput: FormControl;

    initiatorFilterInput: FormControl;

    columns: any;

    previewContent: string;

    detalizedRow: any;

    affectedSearch: any;

    initiatorSearch: any;

    customerFormatter: any;

    states = [{id: 222, title: 'Alabama'}, {id: 12, title: 'Texas'}];


    @ViewChild('table') table: any;

    @ViewChild('customerTemplate') customerTemplate: TemplateRef<any>;

    @ViewChild('dateTemplate') dateTemplate: TemplateRef<any>;

    @ViewChild('realmTemplate') realmTemplate: TemplateRef<any>;

    @ViewChild('actionTemplate') actionTemplate: TemplateRef<any>;

    @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;

    @ViewChild('messageTemplate') messageTemplate: TemplateRef<any>;

    constructor(
        private customerService: CallanCustomerService,
        private lessonService: CallanLessonService
    ) {
        this.initiatorFilterInput = new FormControl('');
        this.affectedFilterInput = new FormControl('');
        this.messageFilterInput = new FormControl('');
    }

    ngOnInit() {
        console.log(this.count, 'count!');
        this.columns = [
            {
                prop: 'message',
                cellTemplate: this.messageTemplate,
                flexGrow: 2
            },
            {
                prop: 'action',
                cellTemplate: this.actionTemplate,
                flexGrow: 1,
            },
            {
                name: 'Item',
                prop: 'itemId',
                cellTemplate: this.itemTemplate,
                flexGrow: 1,
            },
            {
                name: 'Initiator',
                cellTemplate: this.customerTemplate,
                flexGrow: 1,
            },
            {
                name: 'Affected',
                cellTemplate: this.customerTemplate,
                flexGrow: 1,
            },
            {
                name: 'Date',
                cellTemplate: this.dateTemplate,
                flexGrow: 1,
            }
        ];

        this.assignAffectedSearch();
        this.assignInitiatorSearch();
        this.assignCustomerFormatter();
        this.subscribeOnMessageFilter();
    }

    handlePreviewItem(event, row) {
        const el = event.target;

        if (el) {
            const id = el.dataset.itemId;
            const kind = el.dataset.itemKind;
            const previousContent = this.previewContent;

            this.preparePreviewContent(kind, id).subscribe(content => {
                this.previewContent = content;

                if (this.detalizedRow && this.detalizedRow === row && previousContent && content === previousContent) {
                    this.table.rowDetail.collapseAllRows();
                    // because we collapsed, clear "state"
                    this.previewContent = null;

                } else {
                    this.table.rowDetail.collapseAllRows();
                    this.table.rowDetail.toggleExpandRow(row);
                }

                this.detalizedRow = row;

            }, err => {
                ;
            });
        }
    }

    handleSetPage($event) {
        this.setPageEvent.next($event.offset);
    }

    handleAffectedSelect($event) {
        this.initiatorFilterInput.patchValue('', {emitEvent: false});
        this.messageFilterInput.patchValue('', {emitEvent: false});
        this.filterByAffectedEvent.next($event.item);
    }

    handleInitiatorSelect($event) {
        this.affectedFilterInput.patchValue('', {emitEvent: false});
        this.messageFilterInput.patchValue('', {emitEvent: false});
        this.filterByInitiatorEvent.next($event.item);
    }

    getActionTitle(value: string): string {
        return CallanActivityLogService.getActivityLogActionName(value);
    }

    parseMessage(value: string): string {
        return CallanActivityLogService.parseMessage(value);
    }

    getItemPreviewLink(action, value: string, title?, kind?): string {

        if (!kind) {
            kind = CallanActivityLogService.getItemKindByAction(action);
        }

        if (kind && value) {
            if (!title) {
                title = kind.replace(/_/g, ' ').toLowerCase();
                title = title.charAt(0).toUpperCase() + title.slice(1);
            }
            return CallanActivityLogService.getItemPreviewLink(value, kind, title);
        } else {
            return '';
        }
    }

    private subscribeOnMessageFilter() {
        this.messageFilterInput.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged()
        )
            .subscribe(term => {

                this.affectedFilterInput.patchValue('', {emitEvent: false});
                this.initiatorFilterInput.patchValue('', {emitEvent: false});

                if (term.length >= 2) {
                    this.filterByMessageEvent.next(term);

                } else if (term.length === 0) {
                    this.filterByMessageEvent.next();
                }
            });
    }

    private preparePreviewContent(kind, id): Observable<string> {
        switch (kind) {
            default:
                return new Observable<string>(observer => {
                    observer.error('Unknown kind given');
                    observer.complete();
                });
            case(CallanActivityLogItemKindEnum.CUSTOMER):
                return this.preparePreviewCustomer(id);
            case(CallanActivityLogItemKindEnum.LESSON_EVENT):
                return this.previewLessonEvent(id);
            case(CallanActivityLogItemKindEnum.COURSE_PROGRESS):
                return this.previewCourseProgress(id);
        }
    }

    private assignAffectedSearch() {

        this.affectedSearch = (text$: Observable<string>) =>
            text$.pipe(
                debounceTime(300),
                distinctUntilChanged(),
                mergeMap<string, any>(term => {

                    this.filterByAffectedEvent.next(null);

                    if (term.length >= 2) {
                        // emit search to container
                        this.affectedSearchEvent.next(term);

                        // return subscription on affected
                        return this.affectedList$;
                    } else {
                        return [];
                    }
                })
            )
    }

    private assignInitiatorSearch() {
        this.initiatorSearch = (text$: Observable<string>) =>
            text$.pipe(
                debounceTime(300),
                distinctUntilChanged(),
                mergeMap<string, any>(term => {

                    this.filterByInitiatorEvent.next(null);

                    if (term.length >= 2) {
                        // emit search to container
                        this.initiatorSearchEvent.next(term);

                        // return subscription on affected
                        return this.initiatorList$;
                    } else {
                        return [];
                    }
                })
            )
    }

    private assignCustomerFormatter() {
        this.customerFormatter = (x: CallanCustomer) => x.email;
    }

    private preparePreviewCustomer(id): Observable<string> {

        return this.customerService.getCustomer(id)
            .pipe(
                map<CallanCustomer, string>(customer => {
                    if (customer) {

                        const rolesInfo = [];
                        for (const role of customer.roles) {
                            if (rolesInfo.indexOf(role.name) === -1) {
                                rolesInfo.push(role.name);
                            }
                        }

                        return `
<h5>Customer</h5>
<dl>
<dt>Name</dt>
<dd>${customer.getFullName()}</dd>
</dl>
<dl>
<dt>E-mail</dt>
<dd>${customer.email}</dd>
</dl>
<dl>
<dt>Roles</dt>
<dd>${rolesInfo.join(', ')}</dd>
</dl>
`;

                    } else {
                        throwError('No data');
                    }
                })
            );
    }

    private previewCourseProgress(id): Observable<string> {


        return this.lessonService.getCourseProgress(id)
            .pipe(
                map<CallanCourseProgress, string>(progress => {
                    if (progress) {

                        const studentName = progress.customer? progress.customer.getFullName() : '';

                        const formattedMinutesBalance = CallanDateService.formatMinutesAsHoursString(progress.minutesBalance);
                        return `
<h5>Course</h5>
<dl>
<dt>Name</dt>
<dd>${progress.course.title}</dd>
</dl>
<dl>
<dt>Student</dt>
<dd>${studentName}</dd>
</dl>
<dl>
<dt>Current ballance</dt>
<dd>${formattedMinutesBalance}</dd>
</dl>

`;
                    }
                })
            );
    }

    private previewLessonEvent(id): Observable<string> {
        return this.lessonService.getLessonEvent(id)
            .pipe(
                map<CallanLessonEvent, string>(lessonEvent => {

                    if (lessonEvent) {
                        const stateString = CallanLessonService.getLessonEventStateName(lessonEvent.state);
                        const date = formatDate(lessonEvent.startTime, 'short', 'en-US');

                        let cancelationReasonRow = '';
                        if (lessonEvent.cancelationReason) {
                            cancelationReasonRow = `
<dl>
<dt>Cancelation reason</dt>
<dd>${lessonEvent.cancelationReason}</dd>
</dl>`;
                        }

                        let teacherRow = '';
                        if (lessonEvent.teacher) {
                            teacherRow = `
<dl>
<dt>Teacher</dt>
<dd>${lessonEvent.teacher.getFullName()} &lt;${lessonEvent.teacher.email}&gt;</dd>
</dl>
`;
                        }

                        return `
<h5>Lesson event</h5>
<dl>
<dt>Course</dt>
<dd>${lessonEvent.courseProgress.course.title}</dd>
</dl>

<dl>
<dt>Date</dt>
<dd>${date}</dd>
</dl>
<dl>
<dt>Duration</dt>
<dd>${lessonEvent.duration} min.</dd>
</dl>

${teacherRow}
<dl>
<dt>Current state</dt>
<dd>${stateString}</dd>
</dl>
${cancelationReasonRow}
`;
                    }
                })
            );
    }
}
