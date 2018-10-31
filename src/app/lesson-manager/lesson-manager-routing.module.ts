import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import {CallanLessonManagerStudentContainerComponent} from './lesson-manager-student-container.component';

const routes: Routes = [
    {
        path: '',
        component: CallanLessonManagerStudentContainerComponent,
        data: {
            title: 'Lessons'
        },
    },
    {
        path: ':courseProgressId',
        component: CallanLessonManagerStudentContainerComponent,
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
