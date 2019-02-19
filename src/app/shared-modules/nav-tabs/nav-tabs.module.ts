import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CallanNavTabsComponent} from './nav-tabs/nav-tabs.component';
import {AppPipesModule} from '../pipes/pipes.module';
import {FlexLayoutModule} from '@angular/flex-layout';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        AppPipesModule
    ],
    declarations: [CallanNavTabsComponent],
    exports: [CallanNavTabsComponent]
})
export class CallanNavTabsModule {
}
