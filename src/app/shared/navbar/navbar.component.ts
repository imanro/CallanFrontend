import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {interval as observableInterval} from 'rxjs';

import {AppConfig, IAppConfig} from '../../app.config';
import {CallanCustomer} from '../models/customer.model';
import {CallanCustomerService} from '../services/customer.service';
import {CallanLessonEvent} from '../models/lesson-event.model';
import {CallanLessonService} from '../services/lesson.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {CallanLessonEventStateEnum} from '../enums/lesson-event.state.enum';


@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit, OnDestroy {
    toggleClass = 'ft-maximize';

    private unsubscribe: Subject<void> = new Subject();

    // auth related
    authCustomer: CallanCustomer;
    currentCustomer: CallanCustomer;

    // lesson-related
    currentLessonEvent: CallanLessonEvent;
    currentLessonEventRemainingMinutes: number;

    constructor(
        @Inject(AppConfig) private appConfig: IAppConfig,
        private customerService: CallanCustomerService,
        private lessonService: CallanLessonService,
        private location: Location,
        private route: ActivatedRoute,
        private router: Router
    ) {
    }

    ngOnInit() {
        this.assignAuthCustomer();
        this.assignCurrentCustomer();
        this.startCurrentLessonEventRemaingMinutesCheck();
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    private startCurrentLessonEventRemaingMinutesCheck() {
        observableInterval(60000).pipe(
            takeUntil(this.unsubscribe)
        ).subscribe(() => {

            if (this.currentLessonEvent) {
                this.assignCurrentLessonEventRemainingMinutes(this.currentLessonEvent);
            }
        });
    }

    private assignAuthCustomer() {
        this.customerService.getAuthCustomer()
            .subscribe(customer => {
                this.authCustomer = customer;
            });
    }

    private assignCurrentCustomer() {
        this.customerService.getCurrentCustomer$()
            .pipe(
                takeUntil(this.unsubscribe)
            )
            .subscribe(customer => {
                this.currentCustomer = customer;

                if (customer) {
                    console.log(customer);
                    this.assignCurrentLessonEvent(customer);
                }
            });
    }

    private assignCurrentLessonEvent(customer) {
        this.lessonService.getNearestLessonEvent(customer).subscribe(lessonEvent => {
            this.currentLessonEvent = lessonEvent;
            this.assignCurrentLessonEventRemainingMinutes(lessonEvent);
        });
    }

    private assignCurrentLessonEventRemainingMinutes(lessonEvent) {
        const currentDate = new Date();
        const diff = lessonEvent.startTime.getTime() - currentDate.getTime();
        this.currentLessonEventRemainingMinutes = Math.floor(diff / 60000);
        console.log('Minutes left:', this.currentLessonEventRemainingMinutes);
    }

    handleLessonEventView() {

        // set details shown value
        this.lessonService.toggleIsLessonDetailsShown();

        // if we're not in the required module, change address...)
        if (this.router.routerState.snapshot.url.indexOf('/lessons') !== 0) {
            this.router.navigate(['/lessons']);
        }
    }

    handleLessonEventStart() {

        console.log('to start');
        this.lessonService.changetLessonEventState(this.currentLessonEvent, CallanLessonEventStateEnum.STARTED).subscribe(() => {
            this.lessonService.setIsLessonDetailsShown(true);
            console.log('state now is:', this.currentLessonEvent.state);

            // if we're not in the required module, change address...)
            if (this.router.routerState.snapshot.url.indexOf('/lessons') !== 0) {
                this.router.navigate(['/lessons']);
            }
        });
    }

    ToggleClass() {
        if (this.toggleClass === 'ft-maximize') {
            this.toggleClass = 'ft-minimize';
        } else {
            this.toggleClass = 'ft-maximize'
        }
    }
}
