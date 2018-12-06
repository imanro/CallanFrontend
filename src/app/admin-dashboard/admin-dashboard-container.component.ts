import {Component, OnInit} from '@angular/core';
import {CallanActivityLog} from '../shared/models/activity-log.model';
import {CallanActivityLogService} from '../shared/services/activity-log.service';

import {combineLatest as observableCombineLatest, Subject} from 'rxjs';
import {CallanCustomer} from '../shared/models/customer.model';
import {CallanCustomerService} from '../shared/services/customer.service';

@Component({
    selector: 'app-admin-dashboard-container',
    templateUrl: './admin-dashboard-container.component.html',
    styleUrls: ['./admin-dashboard-container.component.scss']
})
export class CallanAdminDashboardContainerComponent implements OnInit {

    activityLogItems: CallanActivityLog[];

    activityLogItemsLimit = 10;

    activityLogItemsOffset = 0;

    activityLogItemsPageOffset = 0;

    activityLogFilterMessage: string;

    activityLogFilterAffectedId: number;

    activityLogFilterInitiatorId: number;

    activityLogItemsCount: number;

    affectedList$ = new Subject<CallanCustomer[]>();

    initiatorList$ = new Subject<CallanCustomer[]>();

    constructor(
        private activityLogService: CallanActivityLogService,
        private customerService: CallanCustomerService
    ) {
    }

    ngOnInit() {
        this.assignActivityLogItems();
    }

    handleActivityLogItemsFilterByMessage(term) {
        this.setActivityLogItemsOffset(0);
        this.findActivityLogItems(term);
    }

    handleActivityLogItemsFilterByAffected(affected: CallanCustomer) {
        this.setActivityLogItemsOffset(0);

        if (affected) {
            this.findActivityLogItems(null, affected.id);
        } else {
            this.findActivityLogItems(null, null);
        }
    }

    handleActivityLogItemsFilterByInitiator(initiator: CallanCustomer) {

        this.setActivityLogItemsOffset(0);

        if (initiator) {
            this.findActivityLogItems(null, null, initiator.id);
        } else {
            this.findActivityLogItems(null, null, null);
        }
    }

    handleSetPageActivityLog(page) {
        this.setActivityLogItemsOffset(page * this.activityLogItemsLimit);
        this.findActivityLogItems(this.activityLogFilterMessage, this.activityLogFilterAffectedId, this.activityLogFilterInitiatorId);
    }

    handleAffectedSearch(term) {
        this.customerService.findCustomers(term).subscribe(customers => {
           this.affectedList$.next(customers);
        });
    }

    handleInitiatorSearch(term) {
        this.customerService.findCustomers(term).subscribe(customers => {
            this.initiatorList$.next(customers);
        });
    }

    private setActivityLogItemsOffset(offset) {
        this.activityLogItemsOffset = offset;
        this.activityLogItemsPageOffset = Math.round(offset / this.activityLogItemsLimit);
    }

    private findActivityLogItems(searchTerm?, affectedId?, initiatorId?) {

        this.activityLogFilterMessage = searchTerm;
        this.activityLogFilterInitiatorId = initiatorId;
        this.activityLogFilterAffectedId = affectedId;

        observableCombineLatest(
            this.activityLogService.findActivityLogItems(searchTerm, affectedId, initiatorId, this.activityLogItemsLimit, this.activityLogItemsOffset),
            this.activityLogService.getActivityLogItemsCount(searchTerm, affectedId, initiatorId),
        ).subscribe(results => {
            this.activityLogItems = results[0];
            this.activityLogItemsCount = results[1];
        });
    }

    private assignActivityLogItems(offset = 0) {
        console.log(offset);
        observableCombineLatest(
            this.activityLogService.getActivityLogItems(this.activityLogItemsLimit, offset),
            this.activityLogService.getActivityLogItemsCount()
        ).subscribe(results => {
            this.activityLogItems = results[0];
            this.activityLogItemsCount = results[1];
        });
    }

}
