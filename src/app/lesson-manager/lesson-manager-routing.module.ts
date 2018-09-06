import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import {CallanLessonManagerContainerComponent} from './lesson-manager-container.component';

const routes: Routes = [
    {
        path: '',
        component: CallanLessonManagerContainerComponent,
        data: {
            title: 'Lessons'
        },
    },
    {
        path: ':courseProgressId',
        component: CallanLessonManagerContainerComponent,
        data: {
            title: 'Course'
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CallanLessonManagerRoutingModule {

}
