import {CallanAuthService} from './auth.service';
import {Observable} from 'rxjs';
import {mockCustomers} from '../data/mock-customers';

export class CallanAuthMockService extends CallanAuthService {

    fetchAuthToken(email: string, password: string): Observable<{id: number, token: string}> {
        return new Observable<{id: number, token: string}>(observer => {
           const customer = mockCustomers[0];
           observer.next({id: customer.id, token: 'asdfzxcv'});
           observer.complete();
        });
    }

    removeAuthToken(token: string): Observable<boolean> {
        return new Observable<boolean>(observer => {
            observer.next(true);
            observer.complete();
        })
    }
}
