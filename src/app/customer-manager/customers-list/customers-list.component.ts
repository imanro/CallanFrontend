import {Component, OnInit, EventEmitter, Input, Output, OnDestroy, ViewChild, TemplateRef} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {LocalDataSource} from 'ng2-smart-table';

import {CallanCustomer} from '../../shared/models/customer.model';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
    selector: 'app-callan-customers-list',
    templateUrl: './customers-list.component.html',
    styleUrls: ['./customers-list.component.scss']
})

export class CallanCustomersListComponent implements OnInit {

    @Input() customers: CallanCustomer[];

    @Input() listRowsLimit: number;

    @Output() setCurrentCustomer = new EventEmitter<any>();

    @Output() viewCustomer = new EventEmitter<CallanCustomer>();

    @ViewChild('columnNameTpl') columnNameTpl: TemplateRef<any>;

    @ViewChild('columnRolesTpl') columnRolesTpl: TemplateRef<any>;

    @ViewChild('columnActionsTpl') columnActionsTpl: TemplateRef<any>;

    columns: any;

    constructor() {
    }

    ngOnInit() {
        this.columns = [
            {
                prop: 'id',
                name: 'ID',
                flexGrow: 1
            },
            {
                prop: 'email',
                name: 'E-mail',
                flexGrow: 3
            },
            {
                prop: 'role',
                cellTemplate: this.columnRolesTpl,
                sortable: false,
                flexGrow: 4
            },
            {
                prop: 'name',
                cellTemplate: this.columnNameTpl,
                sortable: false,
                flexGrow: 5
            },
            {
                prop: 'actions',
                name: '',
                cellTemplate: this.columnActionsTpl,
                cellClass: 'cell-actions',
                sortable: false,
                flexGrow: 1
            },
        ];
    }

    formatRoles(roles) {
        const list = [];
        if (roles) {
            for (const item of roles) {
                list.push(item.name);
            }
        }

        return list.join(', ');
    }

    handleViewCustomer(customer: CallanCustomer) {
        this.viewCustomer.next(customer);
    }

    handleSetCurrentCustomer(customer: CallanCustomer) {
        this.setCurrentCustomer.next(customer);
    }

    handleRowActivate(event) {
        if (event.type === 'click' && (!event.column || event.column.prop !== 'actions')) {
            console.log('act', event);
            this.viewCustomer.next(event.row);
        }
    }
}
