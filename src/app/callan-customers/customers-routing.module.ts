import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import {CallanCustomersComponent} from './customers.component';

const routes: Routes = [
    {
        path: '',
        component: CallanCustomersComponent,
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
