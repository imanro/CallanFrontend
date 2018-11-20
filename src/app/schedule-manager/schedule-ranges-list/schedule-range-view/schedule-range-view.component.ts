import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CallanScheduleService} from '../../../shared/services/schedule.service';
import {CallanScheduleRange} from '../../../shared/models/schedule-range.model';
import {CallanScheduleRangeTypeEnum} from '../../../shared/enums/schedule-range.type.enum';
import {CallanScheduleRangeRegularityEnum} from '../../../shared/enums/schedule-range.regularity.enum';

@Component({
    selector: 'app-schedule-range-view',
    templateUrl: './schedule-range-view.component.html',
    styleUrls: ['./schedule-range-view.component.scss']
})
export class CallanScheduleRangeViewComponent implements OnInit {

    @Input() scheduleRanges: CallanScheduleRange[];

    @Output() scheduleRangeDeleteEvent = new EventEmitter<CallanScheduleRange>();

    staticScheduleService: any;

    scheduleRangeTypeEnum: any;

    scheduleRangeRegularityEnum: any;

    constructor() {
        this.staticScheduleService = CallanScheduleService;
        this.scheduleRangeTypeEnum = CallanScheduleRangeTypeEnum;
        this.scheduleRangeRegularityEnum = CallanScheduleRangeRegularityEnum;
    }

    ngOnInit() {
    }

    handleScheduleRangeDelete(scheduleRange: CallanScheduleRange) {
        this.scheduleRangeDeleteEvent.next(scheduleRange);
    }

}
