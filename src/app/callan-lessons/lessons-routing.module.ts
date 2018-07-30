import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import {CallanLessonsComponent} from './lessons.component';

const routes: Routes = [
    {
        path: '',
        component: CallanLessonsComponent,
        data: {
            title: 'Lessons'
        },
    },
    {
        path: ':courseProgressId',
        component: CallanLessonsComponent,
        data: {
            title: 'Course'
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CallanLessonsRoutingModule {

}
