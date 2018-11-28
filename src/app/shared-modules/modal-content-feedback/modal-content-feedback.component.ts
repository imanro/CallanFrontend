import {Component, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-modal-content-feedback',
    template: `
        <div class="modal-header">
            <h5 class="modal-title">{{title}}</h5>
            <button type="button" class="close" (click)="activeModal.dismiss(false)">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="modal-body">
            <p [innerHTML]="message"></p>
            <div class="form-group">
                <textarea class="form-control" [(ngModel)]="formModel.feedback"></textarea>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" (click)="handleClose(false)">Cancel</button>

            <button type="button" class="btn btn-outline-primary" (click)="handleClose(true)">OK</button>
        </div>
  `
})
export class AppModalContentFeedbackComponent {
    @Input() title;
    @Input() message;

    formModel = {feedback: ''};

    constructor(public activeModal: NgbActiveModal) { }

    handleClose(result) {
        this.activeModal.close({result: result, feedback: this.formModel.feedback});
    }
}
