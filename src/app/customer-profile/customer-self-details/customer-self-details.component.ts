import {Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import {CallanCustomer} from '../../shared/models/customer.model';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {CustomValidators} from 'ng2-validation';
// import {cloneDeep} from 'lodash/cloneDeep';
import * as _ from 'lodash';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {AppFormErrors} from '../../shared/models/form-errors.model';
import {CallanFormHelper} from '../../shared/helpers/form-helper';
import {CallanTimezone} from '../../shared/models/timezone.model';

@Component({
    selector: 'app-callan-customer-self-details',
    templateUrl: './customer-self-details.component.html',
    styleUrls: ['./customer-self-details.component.scss']
})
export class CallanCustomerSelfDetailsComponent implements OnInit, OnDestroy {

    @Input() customer: CallanCustomer;
    @Input() formErrors$ =  new Subject<AppFormErrors>();
    @Input() isSaving = false;

    @Input() timezonesList: CallanTimezone[];

    @Output() customerSave = new EventEmitter<CallanCustomer>();
    @Output() cancel = new EventEmitter<void>();

    formTitle: string;
    customerForm: FormGroup;

    commonFormErrors = [];

    private unsubscribe: Subject<void> = new Subject();

    constructor(
        private fb: FormBuilder,
    ) {
        this.buildForm();
    }

    ngOnInit() {

        this.formTitle = 'Profile';

        if (this.customer) {
            this.setFormValues();
        }

        this.commonFormErrors = [];

        this.formErrors$
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(formErrors => {

                if (formErrors) {
                    console.log('Errors received');

                    const unmapped = CallanFormHelper.bindErrors(formErrors, this.customerForm);
                    console.log('unmapped:', unmapped);

                    if (unmapped.length > 0) {
                        this.commonFormErrors = [];
                        this.commonFormErrors = this.commonFormErrors.concat(unmapped);
                        console.log('common Form errors now', this.commonFormErrors);
                    }
                }
            });
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    handleSaveCustomer() {
        const saveCustomer = this.prepareSaveCustomer();
        console.log('We\'ve prepared following data:', saveCustomer);
        this.customerSave.next(saveCustomer);
    }

    handleCancel() {
        this.cancel.next();
    }

    compareObjects(item1, item2) {
        return item1 && item2 ? item1.id === item2.id : item1 === item2;
    }

    formatTimezoneOffset(string) {
        return string.slice(0, 3) + ':' + string.slice(3);
    }

    private buildForm() {

        const password = new FormControl('', [Validators.minLength(6)]);

        const passwordConfirm = new FormControl('', [Validators.minLength(6), CustomValidators.equalTo(password)]);

        this.customerForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: password,
            passwordConfirm: passwordConfirm,
            timezone: ['', [Validators.required]]
        });

        this.customerForm.valueChanges.subscribe(() => {
            this.commonFormErrors = [];
        });
    }

    private setFormValues() {

        this.customerForm.patchValue({
            'firstName': this.customer.firstName,
            'lastName': this.customer.lastName,
            'email': this.customer.email,
            'timezone': this.customer.timezone
        });
    }


    private prepareSaveCustomer() {
        const saveCustomer = _.cloneDeep(this.customer);
        const formModel = this.customerForm.value;

        saveCustomer.firstName = formModel.firstName;
        saveCustomer.lastName = formModel.lastName;
        saveCustomer.email = formModel.email;
        saveCustomer.password = formModel.password;
        saveCustomer.timezone = formModel.timezone;

        return saveCustomer;
    }

    logError() {
        console.log(this.customerForm.get('password').errors);
    }

}
