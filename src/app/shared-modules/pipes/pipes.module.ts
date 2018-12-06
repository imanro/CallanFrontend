import {NgModule} from '@angular/core';
import {KeysPipe} from './keys.pipe';
import {KeepHtmlPipe} from './keep-html.pipe';

@NgModule({
    declarations: [
        KeysPipe,
        KeepHtmlPipe
    ],
    imports: [],
    exports: [
        KeysPipe,
        KeepHtmlPipe
    ]
})

export class AppPipesModule {

}
