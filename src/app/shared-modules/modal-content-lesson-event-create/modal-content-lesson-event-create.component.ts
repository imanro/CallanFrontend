import {Component, EventEmitter, Input, Output} from '@angular/core';
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
export class AppModalContentLessonEventCreateComponent {
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

        this.durationsList = CallanLessonEventDurationsEnum;

        const durationKeys = Object.keys(CallanLessonEventDurationsEnum);
        this.selectedDuration = durationKeys[1];

        // it wont work in other way :(
        observableTimer(100).subscribe(() => {
            console.log('exposing');
            this.durationChangeEvent.next(Number(durationKeys[1].replace(/[^\d]/, '')));
        });


        // this.durationsList = {a: 'b', c: 'd'};

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

    formatDate(date: Date) {
        return moment(date).format('D.MM.YYYY h:mm A')
    }

    handleDurationChange(duration) {
        this.durationChangeEvent.next(Number(duration.replace(/[^\d]/, '')));
        this.lessonEvent.duration = Number(duration.replace(/[^\d]/, ''));
    }
}
