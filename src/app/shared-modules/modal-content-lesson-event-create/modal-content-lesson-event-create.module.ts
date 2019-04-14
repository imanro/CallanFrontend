import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AppModalContentLessonEventCreateComponent} from './modal-content-lesson-event-create.component';
import {AppPipesModule} from '../pipes/pipes.module';

@NgModule({
    declarations: [
        AppModalContentLessonEventCreateComponent
    ],
    imports: [
        CommonModule,
        AppPipesModule,
        FormsModule
    ],
    exports: [
        AppModalContentLessonEventCreateComponent
    ]
})

export class AppModalContentLessonEventCreate {

}
