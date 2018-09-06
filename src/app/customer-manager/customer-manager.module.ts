import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CallanCustomersRoutingModule} from './customer-manager-routing.module';

import {CallanCustomerManagerContainerComponent} from './customer-manager-container.component';
import {CallanCustomersListComponent} from './customers-list/customers-list.component';

import { Ng2SmartTableModule } from 'ng2-smart-table';

@NgModule({
    declarations: [
        CallanCustomerManagerContainerComponent,
        CallanCustomersListComponent
    ],
    imports: [
        CommonModule,
        Ng2SmartTableModule,
        CallanCustomersRoutingModule,
    ],
    providers: [],
    bootstrap: [
        CallanCustomerManagerContainerComponent
    ]
})

export class CallanCustomerManagerModule {
}
