import {Component, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'ngbd-modal-content',
    template: `
        <div class="modal-header">
            <h5 class="modal-title">{{title}}</h5>
            <button type="button" class="close" (click)="activeModal.dismiss(false)">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="modal-body">
            <div [innerHTML]="body"></div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" (click)="activeModal.close(false)" *ngIf="buttons.cancel">Cancel</button>
            <button type="button" class="btn btn-outline-primary" (click)="activeModal.close(true)" *ngIf="buttons.ok">OK</button>
        </div>
  `
})
export class AppModalContentComponent {
    @Input() title;
    @Input() body;
    @Input() buttons: {[name: string]: boolean};
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

        console.log('btns', this.buttons);
    }
}
