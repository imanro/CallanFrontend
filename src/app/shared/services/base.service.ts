import {Inject, Injectable} from '@angular/core';
import {AppConfig, IAppConfig} from '../../app.config';
import {Observable} from 'rxjs';
import {throwError} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {AppError} from '../models/error.model';

@Injectable()
export abstract class CallanBaseService {

    constructor(
        @Inject(AppConfig) protected appConfig: IAppConfig
    ) {
    }

    protected getApiUrl(path: string): string {
        return this.appConfig.apiUrl + path;

    }

    protected handleHttpError<T>(fallbackData?: any) {
        return (error: any): Observable<T> => {

            console.log('Error is follow', error);

            if (fallbackData) {
                return new Observable<T>(observer => {
                    observer.error(error);
                    console.log('fallback data given', fallbackData);
                    observer.next(fallbackData);
                    observer.complete();

                });
            } else {
                console.log('no fallback data');

                const friendlyError = new AppError();
                friendlyError.error = error;

                if (error instanceof HttpErrorResponse ){
                    friendlyError.httpStatus = error.status;

                    // common errors processing

                    if (error.status === 0) {
                        friendlyError.message = 'It seems like the server is down. Please, try again later';

                    } else {

                        if (error.error && error.error.error) {
                            const container = error.error.error;

                            if (container.message) {
                                friendlyError.message = container.message;
                            }

                            // 401: invalid access token: throw this error

                            // fieldErrors processing
                            if (error.status === 422) {
                                if (container.details && container.details.messages) {
                                    friendlyError.formErrors = container.details.messages;
                                }
                            }
                        }
                    }

                    console.log(friendlyError);
                }

                console.log('throw');
                return throwError(friendlyError);
            }
        };
    }
}
