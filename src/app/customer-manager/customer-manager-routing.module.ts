import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import {CallanCustomerManagerContainerComponent} from './customer-manager-container.component';

const routes: Routes = [
    {
        path: '',
        component: CallanCustomerManagerContainerComponent,
        data: {
            title: 'Customers'
        },
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class CallanCustomersRoutingModule {

}
