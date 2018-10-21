import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {takeUntil} from 'rxjs/operators';

import {CallanCustomer} from '../../shared/models/customer.model';
import {CallanCustomerService} from '../../shared/services/customer.service';
import {CallanFormErrors} from '../../shared/models/form-errors.model';
import {BehaviorSubject, Subject} from 'rxjs';
import {CallanFormHelper} from '../../shared/helpers/form-helper';

@Component({
    selector: 'app-callan-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})

export class CallanLoginComponent implements OnInit, OnDestroy {

    @Input() formErrors$ =  new BehaviorSubject<CallanFormErrors>(null);
    @Output() loginEvent = new EventEmitter<CallanCustomer>();

    loginForm: FormGroup;
    commonFormErrors = [];

    private unsubscribe: Subject<void> = new Subject();

    constructor(
        private fb: FormBuilder,
    ) {
        this.buildForm();
    }

    ngOnInit() {

        this.commonFormErrors = [];

        this.formErrors$
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(formErrors => {

                if(formErrors) {
                    const unmapped = CallanFormHelper.bindErrors(formErrors, this.loginForm);

                    if (unmapped.length > 0) {
                        this.commonFormErrors = [];
                        this.commonFormErrors = this.commonFormErrors.concat(unmapped);
                    }
                }
            });
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    // On submit button click
    handleLogin() {
        const loginCustomer = this.prepareLogin();
        console.log('We\'ve prepared following data:', loginCustomer);
        this.loginEvent.next(loginCustomer);
    }

    private buildForm() {
        this.loginForm = this.fb.group({
            email: ['', Validators.required ],
            password: ['', Validators.required ],
        });

        this.loginForm.valueChanges.subscribe(() => {
            this.commonFormErrors = [];
        });
    }

    private prepareLogin() {
        const customer = CallanCustomerService.createCustomer();
        const formModel = this.loginForm.value;

        customer.email = formModel.email;
        customer.password = formModel.password;

        return customer;
    }
}