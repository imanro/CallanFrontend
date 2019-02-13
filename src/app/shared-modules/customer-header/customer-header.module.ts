import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CallanCustomerHeaderComponent} from './customer-header/customer-header.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [CallanCustomerHeaderComponent],
    exports: [CallanCustomerHeaderComponent]
})
export class CallanCustomerHeaderModule {

}
