import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CallanCustomersRoutingModule} from './customers-routing.module';

import {CallanCustomersComponent} from './customers.component';
import {CallanCustomersListComponent} from './customers-list/customers-list.component';

import { Ng2SmartTableModule } from 'ng2-smart-table';

@NgModule({
    declarations: [
        CallanCustomersComponent,
        CallanCustomersListComponent
    ],
    imports: [
        CommonModule,
        Ng2SmartTableModule,
        CallanCustomersRoutingModule,
    ],
    providers: [],
    bootstrap: [
        CallanCustomersComponent
    ]
})

export class CallanCustomersModule {
}
