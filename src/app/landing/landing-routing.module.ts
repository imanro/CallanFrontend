import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {CallanLandingContainerComponent} from './landing-container/landing-container.component';

const routes: Routes = [
    {
        path: '',
        component: CallanLandingContainerComponent,
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CallanLandingRoutingModule {

}
