import {Component, OnDestroy, OnInit, ChangeDetectorRef, ApplicationRef, Inject} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Subscription} from 'rxjs/Subscription';
import {Location} from '@angular/common';
import {Subject} from 'rxjs/Subject';
import {interval as observableInterval} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {AppConfig, IAppConfig} from '../app.config';

import {CallanCourse} from '../shared/models/course.model';
import {CallanLessonService} from '../shared/services/lesson.service';
import {CallanCustomer} from '../shared/models/customer.model';
import {CallanCustomerService} from '../shared/services/customer.service';
import {CallanCourseProgress} from '../shared/models/course-progress.model';
import {ActivatedRoute} from '@angular/router';
import {CallanLessonEvent} from '../shared/models/lesson-event.model';


@Component({
  selector: 'app-callan-lesson-manager-container',
  templateUrl: './lesson-manager-container.component.html',
  styleUrls: ['./lesson-manager-container.component.scss']
})
export class CallanLessonManagerContainerComponent implements OnInit, OnDestroy {

    allCourses$ = new BehaviorSubject<CallanCourse[]>([]);
    allCoursesSub$: Subscription; // CHECKME

    currentCustomer$: BehaviorSubject<CallanCustomer>;
    currentCustomer: CallanCustomer;

    currentCustomerCourseProgresses$ = new BehaviorSubject<CallanCourseProgress[]>([]);

    currentCourseProgress$ = new BehaviorSubject<CallanCourseProgress>(null);
    currentCourseProgress: CallanCourseProgress;


    // we need this to be a subject
    lessonEvents$ = new BehaviorSubject<CallanLessonEvent[]>([]);

    currentLessonEvent: CallanLessonEvent;
    isCurrentLessonEventStarted = false;
    isCurrentLessonEventTimeSpent = false;
    currentLessonEventRemainingMinutes: number;

    // Helper indicator
    isDetailsShown = false;
    isAddButtonShown = false;

    // checkme
    private isInitialRouteProcessed = false;

    // https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
    private unsubscribe: Subject<void> = new Subject();

  constructor(
      @Inject(AppConfig) private appConfig: IAppConfig,
      private customerService: CallanCustomerService,
      private lessonService: CallanLessonService,
      private location: Location,
      private route: ActivatedRoute
  ) {
  }

  ngOnInit() {

      this.route.params
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(params => {

              // if there is courseProgressId, we can take the student from there
              if (params['courseProgressId'] !== undefined) {
                  this.lessonService.getCourseProgress(params['courseProgressId'])
                      .pipe(takeUntil(this.unsubscribe))
                      .subscribe(courseProgress => {

                          this.customerService.setCurrentCustomer(courseProgress.customer);
                          this.currentCourseProgress$.next(courseProgress);
                          this.isInitialRouteProcessed = true;
                  })
              } else {
                  // just unset course progress
                  this.setCurrentCourseProgress(null);
                  this.isInitialRouteProcessed = true;
              }
          }
      );

      // current customer observe
      this.currentCustomer$ = this.customerService.getCurrentCustomer();

      this.currentCustomer$
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(customer => {

              if (customer) {
                  this.currentCustomer = customer;

                  this.lessonService.getCourseProgresses(customer).subscribe(courseProgresses => {
                      this.currentCustomerCourseProgresses$.next(courseProgresses);
                  });

                  this.lessonService.getLessonEvents(customer).subscribe(lessonEvents => {
                      this.lessonEvents$.next(lessonEvents);
                      this.assignNearestLessonEvent();
                  });
              }
          });

      // courses
      this.lessonService.getAllCourses().subscribe(courses => {
          this.allCourses$.next(courses);
          this.allCourses$.complete();
      });

      // course progresses
      this.currentCustomerCourseProgresses$
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(progresses => {

              if (progresses && progresses.length > 0) {
                  // assigning first progress as current
                  this.setCurrentCourseProgress(progresses[0]);
              }

              // CHECKME
              this.allCoursesSub$ = this.allCourses$
                  .pipe(takeUntil(this.unsubscribe))
                  .subscribe(allCourses => {
                      if (progresses) {
                          console.log('change add button sh', allCourses.length, progresses.length);
                          this.isAddButtonShown = progresses.length < allCourses.length;
                      }
                  });
          });

      // choosen courseProgress
      this.currentCourseProgress$
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(courseProgress => {
              this.currentCourseProgress = courseProgress;
          });


      // current lessonEvent
      observableInterval(this.appConfig.checkNearestLessonEventIntervalSec).pipe(
          takeUntil(this.unsubscribe)
      ).subscribe(value => {
          console.log('asking again for nearest lesson event');
          this.assignNearestLessonEvent();
      });

      observableInterval(this.appConfig.checkCurrentLessonEventStartTimeIntervalSec).pipe(
          takeUntil(this.unsubscribe)
      ).subscribe(value => {
         this.checkCurrentLessonTime();
      });

      observableInterval(60000).pipe(
          takeUntil(this.unsubscribe)
      ).subscribe(() => {
          this.assignRemainingMinutes();
      });

  }

  ngOnDestroy() {
      this.unsubscribe.next();
      this.unsubscribe.complete();
  }

  private setCurrentCourseProgress(courseProgress: CallanCourseProgress) {
      if (this.isInitialRouteProcessed) {
          this.location.replaceState('/lessons/' + courseProgress.id);
          // put int observable
          this.currentCourseProgress$.next(courseProgress);
      }
  }

  private assignNearestLessonEvent() {
      if (this.currentCustomer && this.lessonEvents$.getValue()) {
          console.log('current customer is set, lessonEvents is set');

          this.currentLessonEvent = this.lessonService.getNearestLessonEvent(this.lessonEvents$.getValue());
          this.checkCurrentLessonTime();
          this.assignRemainingMinutes();
      }
  }

  private checkCurrentLessonTime() {
      if (this.currentLessonEvent) {
          console.log('Checking lesson start time');
          // if there is such lesson, check, if it's start time <= currentTime, activate start button

          const currentDate = new Date();
          this.isCurrentLessonEventTimeSpent = this.currentLessonEvent.startTime.getTime() <= currentDate.getTime();
      }

      // (additional logic: if startTime - currentTime > 5 minutes, perform tick every minute, otherwise do it every
      // 10 second, + display message about comming lesson)
  }

  assignRemainingMinutes() {
      if (this.currentLessonEvent) {
          const currentDate = new Date();
          const diff = this.currentLessonEvent.startTime.getTime() - currentDate.getTime();
          this.currentLessonEventRemainingMinutes = Math.floor(diff / 60000);
      }
  }

  handleSelectCourseProgress(courseProgress: CallanCourseProgress) {
      this.setCurrentCourseProgress(courseProgress);
  }

  handleLessonEventCreate($event) {
      console.log('clicked');
      this.isDetailsShown = true;
  }

  handleLessonEventCreateCancel($event) {
      this.isDetailsShown = false;
  }

  handleLessonEventStart() {
      this.isCurrentLessonEventStarted = true;
  }


  handleLessonEventCreateEvent(date: any){

      console.log('weve received', date);

      const lessonEvent = this.lessonService.createLessonEvent();
      this.lessonService.initLessonEvent(lessonEvent);

      // lessonEvent.title = 'Newly created event';
      lessonEvent.startTime = date;

      console.log('weve created', lessonEvent);

      const eventsList = this.lessonEvents$.getValue();
      eventsList.push(lessonEvent);
      this.lessonEvents$.next(eventsList);
  }
}
