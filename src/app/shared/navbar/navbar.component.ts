import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {CallanCustomer} from '../models/customer.model';
import {CallanCustomerService} from '../services/customer.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit, OnDestroy {
    toggleClass = 'ft-maximize';

    private unsubscribe: Subject<void> = new Subject();
    customer: CallanCustomer;

    constructor(private customerService: CallanCustomerService) {
    }

    ngOnInit() {
        this.customerService.getAuthCustomer()
            .pipe(
                takeUntil(this.unsubscribe)
            )
            .subscribe(customer => {
                this.customer = customer;
            })
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }


    ToggleClass() {
        if (this.toggleClass === 'ft-maximize') {
            this.toggleClass = 'ft-minimize';
        } else {
            this.toggleClass = 'ft-maximize'
        }
    }
}
