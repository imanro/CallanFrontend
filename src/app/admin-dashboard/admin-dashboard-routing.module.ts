import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import {CallanAdminDashboardContainerComponent} from './admin-dashboard-container.component';

const routes: Routes = [
    {
        path: '',
        component: CallanAdminDashboardContainerComponent,
        data: {
            title: 'Dashboard'
        },
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class CallanAdminDashboardRoutingModule {

}
