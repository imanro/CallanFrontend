import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import {CallanLessonManagerStudentContainerComponent} from './lesson-manager-student-container.component';
import {CallanLessonManagerTeacherContainerComponent} from './lesson-manager-teacher-container.component';

const routes: Routes = [
    {
        path: 'student',
        children: [
            {
                path: '',
                component: CallanLessonManagerStudentContainerComponent,
                data: {
                    title: 'Lessons'
                },
                pathMatch: 'full'
            },
            {
                path: ':courseProgressId',
                component: CallanLessonManagerStudentContainerComponent,
                data: {
                    title: 'Course'
                }
            }
        ],
    },
    {
        path: 'teacher',
        component: CallanLessonManagerTeacherContainerComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CallanLessonManagerRoutingModule {

}
