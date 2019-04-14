import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import {CallanLessonEvent} from '../../shared/models/lesson-event.model';
import {CallanLessonEventDurationsEnum} from '../../shared/enums/lesson-event-durations.enum';
import {timer as observableTimer} from 'rxjs';

@Component({
    selector: 'ngb-modal-content',
    template: `
        <div class="modal-header">
            <h5 class="modal-title" [innerHtml]="title"></h5>
            <button type="button" class="close" (click)="activeModal.dismiss(false)">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="modal-body">
            <p>The next Lesson will start at:<br/><strong>{{formatDate(lessonEvent.startTime)}}</strong></p>

            <form class="form-horizontal">
                <div class="row">
                <div class="col-sm-6">
                    <div class="form-group row">

                        <label for="lastName" class="label-control">Duration:</label>

                        <div class="input-group">
                            <select [(ngModel)]="selectedDuration" [ngModelOptions]="{standalone: true}" class="form-control form-control-lg" (ngModelChange)="handleDurationChange($event)">
                                <option *ngFor="let duration of durationsList|keys" id="{{duration.key}}"
                                        [value]="duration.key">
                                    {{duration.value}}
                                </option>
                            </select>

                            <div class="input-group-append">
                                <span class="input-group-text" id="basic-addon1">Minutes</span>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </form>
            
            <p *ngIf="isInvalid" class="text-danger mb-0" >Sorry, the Lesson duration  would exceed on not available time. 
                Please, select different duration or choose another time so that the whole lesson duration would fit the available time range</p>

        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" (click)="activeModal.close(false)" *ngIf="buttons.cancel">Cancel</button>
            <button type="button" class="btn btn-outline-primary" (click)="activeModal.close(true)" *ngIf="buttons.ok" [disabled]="isInvalid">OK</button>
        </div>
  `,

    styles: ['.form-group { margin: 0; }']
})
export class AppModalContentLessonEventCreateComponent implements OnInit {
    @Input() title;
    @Input() body;
    @Input() lessonEvent: CallanLessonEvent;
    @Input() isInvalid = false;
    @Input() buttons: {[name: string]: boolean};
    @Output() durationChangeEvent = new EventEmitter<number>();

    selectedDuration: string;
    durationsList: any;

    private allButtons = {ok: true, cancel: true};

    constructor(public activeModal: NgbActiveModal) {
        if (!this.buttons) {
            this.buttons = this.allButtons;
        } else {
            for (const i in this.allButtons) {
                if (this.buttons[i] === undefined) {
                    this.buttons[i] = this.allButtons[i];
                }
            }
        }
    }

    ngOnInit() {
        if (this.lessonEvent) {
            this.durationsList = this.createDurationList();
        } else {
            this.durationsList = CallanLessonEventDurationsEnum;
        }

        const defaultDuration = CallanLessonEventDurationsEnum['60m'];

        for (const key in this.durationsList) {
            if (this.durationsList.hasOwnProperty(key)) {

                if (this.durationsList[key] === defaultDuration) {
                    this.selectedDuration = key;
                    break;
                }
            }
        }

        if (!this.selectedDuration) {
            const durationKeys = Object.keys(this.durationsList);
            if (durationKeys.length > 0) {
                this.selectedDuration = durationKeys[0];
            }
        }

        console.log('exposing', this.selectedDuration);
        this.durationChangeEvent.next(this.durationEnumKeyIntoNumber(this.selectedDuration));

    }

    private createDurationList() {
        const allDurations = CallanLessonEventDurationsEnum;
        const selectedDurations = {};

        for (const key in allDurations) {
            if (allDurations.hasOwnProperty(key)) {
                const duration = this.durationEnumKeyIntoNumber(key);

                if (this.lessonEvent.courseProgress.minutesBalance >= duration) {
                    selectedDurations[key] = allDurations[key];
                }
            }
        }
        return selectedDurations;
    }

    formatDate(date: Date) {
        return moment(date).format('D.MM.YYYY h:mm A');
    }

    handleDurationChange(duration) {
        this.durationChangeEvent.next(this.durationEnumKeyIntoNumber(duration));
        this.lessonEvent.duration = this.durationEnumKeyIntoNumber(duration);
    }

    private durationEnumKeyIntoNumber(key) {
        return Number(key.replace(/[^\d]/, ''));
    }
}
