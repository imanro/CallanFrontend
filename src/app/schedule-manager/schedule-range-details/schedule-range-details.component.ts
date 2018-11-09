import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import * as _ from 'lodash';
import {CallanFormHelper} from '../../shared/helpers/form-helper';
import {AppFormErrors} from '../../shared/models/form-errors.model';
import {CallanScheduleRange} from '../../shared/models/schedule-range.model';
import {CallanScheduleRangeRegularityEnum} from '../../shared/enums/schedule-range.regularity.enum';
import {CallanScheduleRangeTypeEnum} from '../../shared/enums/schedule-range.type.enum';
import {NgbDateStruct, NgbTimeStruct} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-callan-schedule-range-details',
    templateUrl: './schedule-range-details.component.html',
    styleUrls: ['./schedule-range-details.component.scss']
})
export class ScheduleRangeDetailsComponent implements OnInit, OnDestroy {

    @Input() scheduleRange: CallanScheduleRange;

    @Input() formErrors$ =  new BehaviorSubject<AppFormErrors>(null);

    @Output() cancelEvent = new EventEmitter<void>();
    @Output() scheduleRangeSaveEvent = new EventEmitter<CallanScheduleRange>();

    regularitiesList: any;
    typesList: any;
    daysOfWeekList: any;

    scheduleRangeDetailsForm: FormGroup;
    commonFormErrors = [];

    scheduleRangeRegularityEnum: any;

    private unsubscribe: Subject<void> = new Subject();

    constructor(
        private fb: FormBuilder
    ) {
        this.buildForm();
        this.commonFormErrors = [];
        this.scheduleRangeRegularityEnum = CallanScheduleRangeRegularityEnum;
    }

    ngOnInit() {

        this.assignFormErrors();
        this.assignDaysOfWeekList();
        this.assignRegularitiesList();
        this.assignTypesList();
        this.setFormValues();
    }

    ngOnDestroy() {
        this.setFormValues();
    }

    handleCancel() {
        this.cancelEvent.next();
    }

    handleScheduleRangeSave() {
        const saveScheduleRange = this.prepareSaveScheduleRange();
        this.scheduleRangeSaveEvent.next(saveScheduleRange);
    }

    private buildForm() {
        this.scheduleRangeDetailsForm = this.fb.group({
            type: ['', Validators.required],
            regularity: ['', Validators.required],
            dayOfWeek: ['', Validators.required],
            startMinutes: ['', Validators.required],
            endMinutes: ['', Validators.required],
            date: ['']
        });
    }

    private setFormValues() {
        if (this.scheduleRange) {

            this.scheduleRangeDetailsForm.patchValue({
                'type': this.scheduleRange.type,
                'regularity': this.scheduleRange.regularity,
                'dayOfWeek': this.scheduleRange.dayOfWeek,

                'startMinutes': this.convertMinutesToNgbTimeStruct(this.scheduleRange.startMinutes),
                'endMinutes': this.convertMinutesToNgbTimeStruct(this.scheduleRange.endMinutes),

                'date': this.convertDateToNgbDateStruct(this.scheduleRange.date)
            });
        }
    }

    private prepareSaveScheduleRange(): CallanScheduleRange {
        const saveScheduleRange = _.cloneDeep(this.scheduleRange);
        const formModel = this.scheduleRangeDetailsForm.value;

        saveScheduleRange.dayOfWeek = formModel.dayOfWeek;
        saveScheduleRange.regularity = formModel.regularity;

        saveScheduleRange.startMinutes = this.convertNgbTimeStructToMinutes(formModel.startMinutes);
        saveScheduleRange.endMinutes = this.convertNgbTimeStructToMinutes(formModel.endMinutes);

        saveScheduleRange.type = formModel.type;
        saveScheduleRange.date = this.convertNgbDateStructToDate(formModel.date);

        return saveScheduleRange;
    }

    private assignFormErrors() {
        this.formErrors$
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(formErrors => {

                if (formErrors) {
                    console.log('Errors received');

                    const unmapped = CallanFormHelper.bindErrors(formErrors, this.scheduleRangeDetailsForm);
                    console.log('unmapped:', unmapped);

                    if (unmapped.length > 0) {
                        this.commonFormErrors = [];
                        this.commonFormErrors = this.commonFormErrors.concat(unmapped);
                        console.log('common Form errors now', this.commonFormErrors);
                    }
                }
            });
    }

    private assignRegularitiesList() {
        this.regularitiesList = {};
        this.regularitiesList[CallanScheduleRangeRegularityEnum.REGULAR] = 'Regular';
        this.regularitiesList[CallanScheduleRangeRegularityEnum.AD_HOC] = 'Ad hoc';
    }

    private assignTypesList() {
        this.typesList = {};
        this.typesList[CallanScheduleRangeTypeEnum.INCLUSIVE] = 'Inclusive';
        this.typesList[CallanScheduleRangeTypeEnum.EXCLUSIVE] = 'Exclusive';
    }

    private assignDaysOfWeekList() {
        this.daysOfWeekList = {
            1: 'Monday',
            2: 'Tuesday',
            3: 'Wednesday',
            4: 'Thursday',
            5: 'Friday',
            6: 'Saturday',
            0: 'Sunday',
        };
    }

    private convertMinutesToNgbTimeStruct(minutes: number): NgbTimeStruct {
        return { hour: Math.floor(minutes / 60), minute: minutes % 60, second: 0 };
    }

    private convertDateToNgbDateStruct(date: Date): NgbDateStruct {
        return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
    }

    private convertNgbTimeStructToMinutes(struct: NgbTimeStruct): number {
        return struct.hour * 60 + struct.minute;
    }

    private convertNgbDateStructToDate(struct: NgbDateStruct): Date {
        const date = new Date();
        date.setFullYear(struct.year);
        date.setDate(struct.day);
        date.setMonth(struct.month - 1);
        return date;
    }
}
