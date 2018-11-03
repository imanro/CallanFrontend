import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {CallanCustomer} from '../shared/models/customer.model';
import {CallanCourseProgress} from '../shared/models/course-progress.model';

@Component({
    selector: 'app-lesson-balance',
    templateUrl: './lesson-balance.component.html',
    styleUrls: ['./lesson-balance.component.scss']
})
export class LessonBalanceComponent implements OnInit {

    @Input() courseProgress: CallanCourseProgress;

    constructor(
    ) {
    }

    ngOnInit() {
    }

}
