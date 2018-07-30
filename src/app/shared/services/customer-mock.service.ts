import {Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {delay} from 'rxjs/operators';

// import { CallanCustomersModule } from '../callan.module';
import {CallanCustomerService} from './customer.service';
import {CallanCustomer} from '../models/callan-customer.model';
import {AppConfig, IAppConfig} from '../../app.config';
import {mockCustomers} from '../data/mock-customers';

// @Injectable({
//  providedIn: CallanCustomersModule
// })

@Injectable()
export class CallanCustomerMockService extends CallanCustomerService {

    constructor(
        @Inject(AppConfig) private appConfig: IAppConfig
    ) {
        super();
    }

    getCustomers(): Observable<CallanCustomer[]> {
        const d = this.appConfig.mockDelayMs;
        return new Observable<CallanCustomer[]>(observer => {
            observer.next(mockCustomers);
            observer.complete();
        }).pipe(
            delay(d)
        );
    }
}
