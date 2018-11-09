import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {CallanScheduleRange} from '../../shared/models/schedule-range.model';
import {takeUntil} from 'rxjs/operators';
import {CallanScheduleService} from '../../shared/services/schedule.service';
import {CallanScheduleRangeRegularityEnum} from '../../shared/enums/schedule-range.regularity.enum';
import {CallanScheduleRangeTypeEnum} from '../../shared/enums/schedule-range.type.enum';
import {CallanDayOfWeekEnum} from '../../shared/enums/day-of-week.enum';

@Component({
    selector: 'app-callan-schedule-ranges-list',
    templateUrl: './callan-schedule-ranges-list.component.html',
    styleUrls: ['./callan-schedule-ranges-list.component.scss']
})
export class CallanScheduleRangesListComponent implements OnInit, OnDestroy {

    @Input() scheduleRanges$: Observable<CallanScheduleRange[]>;

    scheduleRangesRegularInclusive: {[dayNumber: number]: CallanScheduleRange[]} ;
    scheduleRangesRegularSummarized: {[dayNumber: number]: CallanScheduleRange[]} ;

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

                console.log('R:', scheduleRanges);

                const grouped = CallanScheduleService.groupScheduleRanges(
                    scheduleRanges,
                    CallanScheduleRangeRegularityEnum.REGULAR
                );


                console.log('G:', grouped);

                this.scheduleRangesRegularInclusive = CallanScheduleService.splitGrouopedScheduleRanges(grouped);

                console.log('S:', this.scheduleRangesRegularInclusive);
            });
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
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
