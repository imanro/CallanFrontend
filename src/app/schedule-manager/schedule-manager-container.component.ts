import {Component, OnDestroy, OnInit} from '@angular/core';
import {ScheduleManagerViewNameEnum} from '../shared/enums/schedule-manager-view.name.enum';

@Component({
    selector: 'app-schedule-manager-container',
    templateUrl: './schedule-manager-container.component.html',
    styleUrls: ['./schedule-manager-container.component.scss']
})
export class CallanScheduleManagerContainerComponent implements OnInit, OnDestroy {

    view = ScheduleManagerViewNameEnum.DEFAULT;
    viewNameEnum: any;

    constructor(
    ) {
        this.viewNameEnum = ScheduleManagerViewNameEnum;

        console.log('tof:', typeof(this.viewNameEnum));
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    handleRangeDetailsCancel() {
        this.view = ScheduleManagerViewNameEnum.DEFAULT;
    }

    handleShowRangeDetails() {
        this.view = ScheduleManagerViewNameEnum.RANGE_DETAILS;
    }
}
