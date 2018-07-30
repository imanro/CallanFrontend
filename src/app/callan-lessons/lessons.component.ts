import {Component, OnDestroy, OnInit, ChangeDetectorRef, ApplicationRef} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Subscription} from 'rxjs/Subscription';
import {Location} from '@angular/common';
import {Subject} from 'rxjs/Subject';
import {takeUntil} from 'rxjs/operators';

import {CallanCourse} from '../shared/models/callan-course.model';
import {CallanLessonService} from '../shared/services/lesson.service';
import {CallanCustomer} from '../shared/models/callan-customer.model';
import {CallanCustomerService} from '../shared/services/customer.service';
import {CallanCourseProgress} from '../shared/models/callan-course-progress.model';
import {ActivatedRoute} from '@angular/router';
import {CallanLessonEvent} from '../shared/models/callan-lesson-event.model';


@Component({
  selector: 'app-lessons',
  templateUrl: './lessons.component.html',
  styleUrls: ['./lessons.component.scss']
})
export class CallanLessonsComponent implements OnInit, OnDestroy {

    allCourses$: Observable<CallanCourse[]>;
    allCoursesSub$: Subscription; // CHECKME

    currentCustomer$: BehaviorSubject<CallanCustomer>;
    currentCustomer: CallanCustomer;

    currentCustomerCourseProgresses$: BehaviorSubject<CallanCourseProgress[]>;

    currentCourseProgress$: BehaviorSubject<CallanCourseProgress>;
    currentCourseProgress: CallanCourseProgress;

    // Helper indicator
    isDetailsShown = false;

    // checkme
    private isInitialRouteProcessed = false;
    isAddButtonShown = false;

    lessonEvents$ = new BehaviorSubject<CallanLessonEvent[]>([]);

    // https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
    private unsubscribe: Subject<void> = new Subject();

  constructor(
      private customerService: CallanCustomerService,
      private lessonService: CallanLessonService,
      private location: Location,
      private route: ActivatedRoute,
      private changeDetectorRef: ChangeDetectorRef,
      private applicationRef: ApplicationRef
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

                      this.lessonService.setCurrentCourseProgress(courseProgress);
                      this.customerService.setCurrentCustomer(courseProgress.customer);
                      this.isInitialRouteProcessed = true;
                  })
              } else {
                  // just unset course progress
                  this.lessonService.setCurrentCourseProgress(null);
                  this.isInitialRouteProcessed = true;
              }
          }
      );

      this.allCourses$ = this.lessonService.getAllCourses();

      this.currentCourseProgress$ = this.lessonService.getCurrentCourseProgress();

      this.currentCourseProgress$
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(courseProgress => {
              this.currentCourseProgress = courseProgress;
          });

      this.currentCustomerCourseProgresses$ = this.lessonService.getCourseProgresses();

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

      // current customer observe
      this.currentCustomer$ = this.customerService.getCurrentCustomer();

      this.currentCustomer$
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(customer => {

              if (customer instanceof CallanCustomer) {
                  this.currentCustomer = customer;
                  console.log('assign');
                  this.lessonService.assignCourseProgresses(customer);
              }
          });

      this.currentCourseProgress$ = this.lessonService.getCurrentCourseProgress();

      this.currentCourseProgress$
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(courseProgress => {
          // console.log('cp is set', courseProgress);
         this.currentCourseProgress = courseProgress;
      });

      console.log('in "shell": ', this.lessonEvents$);
      this.lessonEvents$.next( this.lessonService.createLessonEventsDev());
  }

  ngOnDestroy() {
      this.unsubscribe.next();
      this.unsubscribe.complete();
  }

  private setCurrentCourseProgress(courseProgress: CallanCourseProgress) {
      if (this.isInitialRouteProcessed) {
          this.location.replaceState('/lessons/' + courseProgress.id);
          this.lessonService.setCurrentCourseProgress(courseProgress);
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

  handleLessonEventCreateEvent(date: any){

      console.log('weve received', date);

      const lessonEvent = this.lessonService.createLessonEvent();
      this.lessonService.initLessonEvent(lessonEvent);

      lessonEvent.title = 'Newly created event';
      lessonEvent.startTime = date;

      console.log('weve created', lessonEvent);

      const eventsList = this.lessonEvents$.getValue();
      eventsList.push(lessonEvent);
      this.lessonEvents$.next(eventsList);
  }
}
