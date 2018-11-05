import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {CallanScheduleManagerContainerComponent} from './schedule-manager-container.component';

const routes: Routes = [
    {
        path: '',
        component: CallanScheduleManagerContainerComponent,
        data: {
            title: 'Schedule'
        },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CallanScheduleManagerRoutingModule {
}
