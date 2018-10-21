import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {LocalDataSource} from 'ng2-smart-table';

import {CallanCustomer} from '../../shared/models/customer.model';

@Component({
    selector: 'app-callan-customers-list',
    templateUrl: './customers-list.component.html',
    styleUrls: ['./callan-customers-list.component.scss']
})

export class CallanCustomersListComponent implements OnInit {

    @Input() customers$: Observable<CallanCustomer[]>;
    @Output() setCurrentCustomer = new EventEmitter<any>();

    source: LocalDataSource;
    settings: any;

    constructor() {
        this.source = new LocalDataSource();

        this.settings = {
            columns: {
                id: {
                    title: 'ID',
                    filter: false,
                },
                email: {
                    title: 'E-mail',
                    filter: false,
                },
                firstName: {
                    title: 'First Name',
                    filter: false,
                },
                lastName: {
                    title: 'Last Name',
                    filter: false,
                },
                roles: {
                    title: 'Roles',
                    filter: false,
                    valuePrepareFunction: function (value) {
                        const list = [];
                        if (value) {
                            for (const item of value) {
                                list.push(item.name);
                            }
                        }

                        return list.join(', ');
                    }
                }
            },
            hideSubHeader: true,

            actions: {
                custom: [
                    {
                        name: 'setCurrent',
                        title: '<i class="ft-user-check success font-medium-1 mr-2" title="Set user for on-behave"></i>',
                    },
                ],
                add: false,
                edit: false,
                delete: false,
                position: 'right'
            },
            attr: {
                class: 'table table-responsive'
            },
            edit: {
                editButtonContent: '<i class="ft-edit-2 info font-medium-1 mr-2"></i>'
            },
            delete: {
                deleteButtonContent: '<i class="ft-x danger font-medium-1 mr-2"></i>'
            },
            custom: {
                setCurrentButtonContent: ''
            }
        };
    }

    onCustom(event) {
        // emit the data
        this.setCurrentCustomer.next(event.data);
    }

    ngOnInit() {
        this.customers$.subscribe(customers => {
            this.source.load(customers);
            // console.log(customers);
        });
    }
}
