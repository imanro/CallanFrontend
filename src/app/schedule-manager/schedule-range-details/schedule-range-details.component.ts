import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BehaviorSubject, timer as observableTimer, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import * as _ from 'lodash';
import {CallanFormHelper} from '../../shared/helpers/form-helper';
import {AppFormErrors} from '../../shared/models/form-errors.model';
import {CallanScheduleRange} from '../../shared/models/schedule-range.model';
import {CallanScheduleRangeRegularityEnum} from '../../shared/enums/schedule-range.regularity.enum';
import {CallanScheduleRangeTypeEnum} from '../../shared/enums/schedule-range.type.enum';
import {NgbDateStruct, NgbTimeStruct} from '@ng-bootstrap/ng-bootstrap';
import {CallanScheduleService} from '../../shared/services/schedule.service';

@Component({
    selector: 'app-callan-schedule-range-details',
    templateUrl: './schedule-range-details.component.html',
    styleUrls: ['./schedule-range-details.component.scss']
})
export class ScheduleRangeDetailsComponent implements OnInit, OnDestroy {

    @Input() scheduleRange: CallanScheduleRange;

    @Input() formErrors$ =  new BehaviorSubject<AppFormErrors>(null);

    @Input() scheduleMinuteStep = 60;

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

    // to compare form value with constant
    toNumber(value: any): number {
        return Number(value);
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

        this.scheduleRangeDetailsForm.valueChanges.subscribe(() => {
            this.commonFormErrors = [];
        });



        this.scheduleRangeDetailsForm.get('startMinutes').valueChanges.subscribe(value => {
            this.fixStartMinutes();
           this.fixEndMinutesByStart(value);
        });

        this.scheduleRangeDetailsForm.get('endMinutes').valueChanges.subscribe(value => {
            this.fixEndMinutes();
            this.fixStartMinutesByEnd(value);
        });
    }

    private setFormValues() {
        if (this.scheduleRange) {

            this.scheduleRangeDetailsForm.patchValue({
                'type': this.scheduleRange.type,
                'regularity': this.scheduleRange.regularity,
                'dayOfWeek': this.scheduleRange.dayOfWeek,

                'startMinutes': this.convertMinutesToNgbTimeStruct(this.scheduleRange.startMinutes),
                'endMinutes': this.convertMinutesToNgbTimeStruct(this.scheduleRange.startMinutes + this.scheduleRange.minutesAmount),

                'date': this.convertDateToNgbDateStruct(this.scheduleRange.date)
            });
        }
    }

    private prepareSaveScheduleRange(): CallanScheduleRange {
        const saveScheduleRange = _.cloneDeep(this.scheduleRange);
        const formModel = this.scheduleRangeDetailsForm.value;

        saveScheduleRange.dayOfWeek = formModel.dayOfWeek;
        saveScheduleRange.regularity = Number(formModel.regularity);
        saveScheduleRange.type = Number(formModel.type);

        saveScheduleRange.startMinutes = this.convertNgbTimeStructToMinutes(formModel.startMinutes);
        const endMinutes = this.convertNgbTimeStructToMinutes(formModel.endMinutes);

        saveScheduleRange.minutesAmount = CallanScheduleService.getMinutesAmountByMinutesRange(saveScheduleRange.startMinutes, endMinutes);
        console.log('em:', endMinutes);
        console.log('sm:', saveScheduleRange.startMinutes);
        console.log('dif:', endMinutes - saveScheduleRange.startMinutes);

        saveScheduleRange.date = this.convertNgbDateStructToDate(formModel.date);

        CallanScheduleService.convertToUtcTime(saveScheduleRange);

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
        this.typesList[CallanScheduleRangeTypeEnum.INCLUSIVE] = 'Working time';
        this.typesList[CallanScheduleRangeTypeEnum.EXCLUSIVE] = 'Break time';
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
        console.log('convert?', struct.hour);
        return struct.hour * 60 + struct.minute;
    }

    private convertNgbDateStructToDate(struct: NgbDateStruct): Date {
        const date = new Date();
        date.setFullYear(struct.year);
        date.setDate(struct.day);
        date.setMonth(struct.month - 1);
        return date;
    }

    private fixEndMinutesByStart(startValue: NgbTimeStruct): void {
        const endValue: NgbTimeStruct = this.scheduleRangeDetailsForm.get('endMinutes').value;

        if ((startValue.hour > endValue.hour && endValue.hour !== 0) || (startValue.hour === endValue.hour && startValue.minute >= endValue.minute)) {
            if (startValue.hour <= 23) {
                this.scheduleRangeDetailsForm.patchValue({
                    'endMinutes': {
                        hour: startValue.hour + 1 < 24 ? startValue.hour + 1 : 0,
                        minute: startValue.minute,
                        second: endValue.second
                    }
                }, {emitEvent: false});
            }
        }
    }

    private fixStartMinutesByEnd(endValue: NgbTimeStruct): void {
        const startValue: NgbTimeStruct = this.scheduleRangeDetailsForm.get('startMinutes').value;

        if ((endValue.hour !== 0 && endValue.hour < startValue.hour) || (endValue.hour === startValue.hour && endValue.minute <= startValue.minute)) {
            if (endValue.hour >= 0) {
                console.log('fixing', endValue.hour - 1, '!!!');
                this.scheduleRangeDetailsForm.patchValue({
                    'startMinutes': {
                        hour: endValue.hour - 1 >= 0 ? endValue.hour - 1 : 23,
                        minute: endValue.minute,
                        second: startValue.second
                    }
                }, {emitEvent: false});
            }
        }
    }

    private fixStartMinutes(): void {
        const startValue: NgbTimeStruct = this.scheduleRangeDetailsForm.get('startMinutes').value;

        if (startValue.minute % this.scheduleMinuteStep) {
            observableTimer(100).subscribe(() => {
                this.scheduleRangeDetailsForm.patchValue({
                    'startMinutes': {
                        hour: startValue.hour,
                        minute: startValue.minute - (startValue.minute % this.scheduleMinuteStep),
                        second: startValue.second
                    }
                }, {emitEvent: false});
            });
        }

    }

    private fixEndMinutes(): void {
        const endValue: NgbTimeStruct = this.scheduleRangeDetailsForm.get('endMinutes').value;

        if (endValue.minute % this.scheduleMinuteStep) {
            observableTimer(100).subscribe(() => {
                this.scheduleRangeDetailsForm.patchValue({
                    'endMinutes': {
                        hour: endValue.hour,
                        minute: endValue.minute - (endValue.minute % this.scheduleMinuteStep),
                        second: endValue.second
                    }
                }, {emitEvent: false});
            });
        }
    }
}
