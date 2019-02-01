import {Component, OnInit, EventEmitter, Input, Output, OnDestroy} from '@angular/core';
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

export class CallanCustomersListComponent implements OnInit, OnDestroy {

    @Input() customers$: Observable<CallanCustomer[]>;

    @Output() setCurrentCustomer = new EventEmitter<any>();

    @Output() viewCustomer = new EventEmitter<CallanCustomer>();

    source: LocalDataSource;
    settings: any;

    private unsubscribe: Subject<void> = new Subject();

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
                    filter: false
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
                    {
                        name: 'view',
                        title: '<i class="ft-eye info font-medium-1 mr-2" title="View customer"></i>'
                    }
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

    ngOnInit() {
        this.customers$
            .pipe(
                takeUntil(this.unsubscribe)
            )
            .subscribe(customers => {
                this.source.load(customers);
                // console.log(customers);
            });
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    handleCustomAction($e) {
        // emit the data
        switch ($e.action) {
            case('setCurrent'):
                this.setCurrentCustomer.next($e.data);
                break;
            case('view'):
                this.viewCustomer.next($e.data);
                console.log($e);
                break;
        }
    }

    handleRowSelect($e) {
        this.viewCustomer.next($e.data);
    }
}
