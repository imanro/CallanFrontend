import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import {ReactiveFormsModule} from '@angular/forms';

import {CallanCustomersRoutingModule} from './customer-manager-routing.module';
import {CallanCustomerManagerContainerComponent} from './customer-manager-container.component';
import {CallanCustomersListComponent} from './customers-list/customers-list.component';
import { CallanCustomerDetailsComponent } from './customer-details/customer-details.component';
import { CustomerViewComponent } from './customer-view/customer-view.component';


@NgModule({
    declarations: [
        CallanCustomerManagerContainerComponent,
        CallanCustomersListComponent,
        CallanCustomerDetailsComponent,
        CustomerViewComponent
    ],
    imports: [
        CommonModule,
        Ng2SmartTableModule,
        ReactiveFormsModule,
        CallanCustomersRoutingModule,
    ],
    providers: [],
    bootstrap: [
        CallanCustomerManagerContainerComponent
    ]
})

export class CallanCustomerManagerModule {
}
