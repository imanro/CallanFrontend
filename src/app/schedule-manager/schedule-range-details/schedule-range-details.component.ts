import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {CallanFormHelper} from '../../shared/helpers/form-helper';
import {CallanFormErrors} from '../../shared/models/form-errors.model';

@Component({
    selector: 'app-callan-schedule-range-details',
    templateUrl: './schedule-range-details.component.html',
    styleUrls: ['./schedule-range-details.component.scss']
})
export class ScheduleRangeDetailsComponent implements OnInit, OnDestroy {

    @Input() formErrors$ =  new BehaviorSubject<CallanFormErrors>(null);

    @Output() cancelEvent = new EventEmitter<void>();

    scheduleRangeDetailsForm: FormGroup;
    commonFormErrors = [];

    private unsubscribe: Subject<void> = new Subject();

    constructor(
        private fb: FormBuilder
    ) {
        this.buildForm();


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

        this.commonFormErrors = [];
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.setFormValues();
    }

    handleCancel() {
        this.cancelEvent.next();
    }

    private buildForm() {
        this.scheduleRangeDetailsForm = this.fb.group({
            type: ['', Validators.required]
        });
    }

    private setFormValues() {
    }

}
