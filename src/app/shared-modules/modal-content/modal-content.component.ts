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
            <button type="button" class="btn btn-outline-secondary" (click)="activeModal.close(false)">Cancel</button>

            <button type="button" class="btn btn-outline-primary" (click)="activeModal.close(true)">OK</button>
        </div>
  `
})
export class AppModalContentComponent {
    @Input() title;
    @Input() body;

    constructor(public activeModal: NgbActiveModal) {}
}
