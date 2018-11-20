import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {CallanScheduleRange} from '../../shared/models/schedule-range.model';
import {takeUntil} from 'rxjs/operators';
import {CallanScheduleService} from '../../shared/services/schedule.service';
import {CallanScheduleRangeRegularityEnum} from '../../shared/enums/schedule-range.regularity.enum';
import {CallanScheduleRangeTypeEnum} from '../../shared/enums/schedule-range.type.enum';
import {CallanDayOfWeekEnum} from '../../shared/enums/day-of-week.enum';

@Component({
    selector: 'app-callan-schedule-ranges-list',
    templateUrl: './schedule-ranges-list.component.html',
    styleUrls: ['./schedule-ranges-list.component.scss']
})
export class CallanScheduleRangesListComponent implements OnInit, OnDestroy {

    @Input() scheduleRanges$: Observable<CallanScheduleRange[]>;

    @Input() currentDate: Date;

    @Output() scheduleRangeDeleteEvent = new EventEmitter<CallanScheduleRange>();

    scheduleRangesRegularInclusive: {[dayNumber: number]: CallanScheduleRange[]} ;
    scheduleRangesRegularExclusive: {[dayNumber: number]: CallanScheduleRange[]} ;

    scheduleRangesAdHocInclusive: {[dayNumber: number]: CallanScheduleRange[]} ;
    scheduleRangesAdHocExclusive: {[dayNumber: number]: CallanScheduleRange[]} ;

    dayOfWeekEnum: any;
    dayOfWeekTitles: {[dayNumber: string]: string};
    dayOfWeekOrder = [1, 2, 3, 4, 5, 6, 0];
    staticScheduleService: any;

    private unsubscribe: Subject<void> = new Subject();

    constructor(
    ) {
        this.dayOfWeekEnum = CallanDayOfWeekEnum;
        this.assignDayOfWeekTitles();
        this.staticScheduleService = CallanScheduleService;
    }

    ngOnInit() {
        this.scheduleRanges$
            .pipe(
                takeUntil(this.unsubscribe)
            )
            .subscribe(scheduleRanges => {

                this.scheduleRangesRegularInclusive = CallanScheduleService.groupScheduleRanges(
                    scheduleRanges,
                    CallanScheduleRangeRegularityEnum.REGULAR,
                    CallanScheduleRangeTypeEnum.INCLUSIVE
                );

                this.scheduleRangesRegularExclusive = CallanScheduleService.groupScheduleRanges(
                    scheduleRanges,
                    CallanScheduleRangeRegularityEnum.REGULAR,
                    CallanScheduleRangeTypeEnum.EXCLUSIVE
                );

                this.scheduleRangesAdHocInclusive = CallanScheduleService.groupScheduleRanges(
                    scheduleRanges,
                    CallanScheduleRangeRegularityEnum.AD_HOC,
                    CallanScheduleRangeTypeEnum.INCLUSIVE
                );

                this.scheduleRangesAdHocExclusive = CallanScheduleService.groupScheduleRanges(
                    scheduleRanges,
                    CallanScheduleRangeRegularityEnum.AD_HOC,
                    CallanScheduleRangeTypeEnum.EXCLUSIVE
                );
            });
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    handleScheduleRangeDelete(scheduleRange: CallanScheduleRange) {
        this.scheduleRangeDeleteEvent.next(scheduleRange);
    }

    private assignDayOfWeekTitles() {
        this.dayOfWeekTitles = {};

        this.dayOfWeekTitles[CallanDayOfWeekEnum.MONDAY] = 'Monday';
        this.dayOfWeekTitles[CallanDayOfWeekEnum.TUESDAY] = 'Tuesday';
        this.dayOfWeekTitles[CallanDayOfWeekEnum.WEDNESDAY] = 'Wednesday';
        this.dayOfWeekTitles[CallanDayOfWeekEnum.THURSDAY] = 'Thursday';
        this.dayOfWeekTitles[CallanDayOfWeekEnum.FRIDAY] = 'Friday';
        this.dayOfWeekTitles[CallanDayOfWeekEnum.SATURDAY] = 'Saturday';
        this.dayOfWeekTitles[CallanDayOfWeekEnum.SUNDAY] = 'Sunday';

        console.log(this.dayOfWeekTitles);
    }

}
