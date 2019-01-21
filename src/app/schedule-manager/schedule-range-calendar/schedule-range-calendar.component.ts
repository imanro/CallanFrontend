import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {CallanCustomer} from '../../shared/models/customer.model';

@Component({
    selector: 'app-callan-schedule-range-calendar',
    templateUrl: './schedule-range-calendar.component.html',
    styleUrls: ['./schedule-range-calendar.component.scss']
})
export class CallanScheduleRangeCalendarComponent implements OnInit {

    @Input() customer: CallanCustomer;

    @Input() refresh$: Subject<void>;

    @Input() currentDate: Date;

    @Input() datesEnabled: Date[];

    @Input() scheduleMinuteStep: number;

    @Output() setCurrentDateEvent = new EventEmitter<Date>();

    calendarView: string;

    hourSegmentsAmount = 4;

    ngOnInit() {
        this.calendarView = 'week';

        if (this.scheduleMinuteStep){
            this.hourSegmentsAmount = 60 / this.scheduleMinuteStep;
        }
    }

    handleShowPreviousWeek() {
        if (this.currentDate) {
            this.currentDate.setDate(this.currentDate.getDate() - 7);
            this.setCurrentDate(this.currentDate);
        }
    }

    handleShowNextWeek() {
        if (this.currentDate) {
            this.currentDate.setDate(this.currentDate.getDate() + 7);
            this.setCurrentDate(this.currentDate);
        }
    }

    handleShowCurrentWeek() {
        this.setCurrentDate(new Date());
    }

    private setCurrentDate(date: Date) {
        this.setCurrentDateEvent.next(date);
    }
}
