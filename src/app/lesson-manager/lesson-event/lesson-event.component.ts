import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {CallanLessonEvent} from '../../shared/models/lesson-event.model';
import {CallanLessonEventStateEnum} from '../../shared/enums/lesson-event.state.enum';
import {CallanLessonService} from '../../shared/services/lesson.service';
import {CallanLessonEventViewEnum} from '../../shared/enums/lesson-event.view.enum';

@Component({
    selector: 'app-callan-lesson-event',
    templateUrl: './lesson-event.component.html',
    styleUrls: ['./lesson-event.component.scss']
})
export class CallanLessonEventComponent implements OnInit {

    @Input() lessonEvent: CallanLessonEvent;

    @Input() isConfirmButtonCanBeShown: boolean;

    @Input() view: string;

    @Output() lessonEventConfirmEvent = new EventEmitter<CallanLessonEvent>();

    lessonEventStateEnum: any;

    viewNameEnum: any;

    constructor() {
        this.lessonEventStateEnum = CallanLessonEventStateEnum;
        this.isConfirmButtonCanBeShown = false;

        this.viewNameEnum = CallanLessonEventViewEnum;
    }


    handleLessonEventConfirm($e) {
        this.lessonEventConfirmEvent.next($e);
    }

    ngOnInit() {
    }

    getStateTitle(value: any) {
        return CallanLessonService.getLessonEventStateName(value);
    }

    getStateIcon(value: any) {
        //const title = CallanLessonService.getLessonEventStateName(value);

        switch (value) {
            default:
            case(CallanLessonEventStateEnum.PLANNED):
                return 'icon-list';
            case(CallanLessonEventStateEnum.STARTED):
                return 'ft-check-circle';
            case(CallanLessonEventStateEnum.COMPLETED):
                return 'ft-flag';
            case(CallanLessonEventStateEnum.CONFIRMED):
                return 'icon-badge';
            case(CallanLessonEventStateEnum.CANCELED):
                return 'ft-minus-circle';
        }
    }

    getStateClass(value: any) {
        //const title = CallanLessonService.getLessonEventStateName(value);

        switch (value) {
            default:
            case(CallanLessonEventStateEnum.PLANNED):
                return '';
            case(CallanLessonEventStateEnum.STARTED):
                return 'primary';
            case(CallanLessonEventStateEnum.COMPLETED):
                return 'info';
            case(CallanLessonEventStateEnum.CONFIRMED):
                return 'success';
            case(CallanLessonEventStateEnum.CANCELED):
                return 'warning';
        }
    }

}
