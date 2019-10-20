import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CallanAuthContainerComponent} from './auth-container.component';

const routes: Routes = [
    {
        path: '',
        component: CallanAuthContainerComponent,
        data: {
            title: 'Auth'
        },
    },
    {
        path: 'login',
        component: CallanAuthContainerComponent,
        data: {
            title: 'Auth'
        },
    },
    {
        path: 'logout',
        component: CallanAuthContainerComponent,
        data: {
            title: 'Auth'
        },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class CallanAuthRoutingModule {

}
