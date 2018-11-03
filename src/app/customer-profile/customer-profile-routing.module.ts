import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CustomerProfileContainerComponent} from './customer-profile-container.component';


const routes: Routes = [
    {
        path: '',
        component: CustomerProfileContainerComponent,
        data: {
            title: 'Customers'
        },
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class CallanCustomerProfileRoutingModule {

}
