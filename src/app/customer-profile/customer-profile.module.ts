import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerProfileContainerComponent } from './customer-profile-container.component';
import {CallanCustomerSelfDetailsComponent} from './customer-self-details/customer-self-details.component';
import {CallanCustomerProfileRoutingModule} from './customer-profile-routing.module';
import {ReactiveFormsModule} from '@angular/forms';
import { CallanCustomerSelfViewComponent } from './customer-self-view/customer-self-view.component';
import { CallanCustomerGoogleAuthComponent } from './customer-google-auth/customer-google-auth.component';
import {CallanCustomerHeaderModule} from '../shared-modules/customer-header/customer-header.module';

@NgModule({
  imports: [
      CommonModule,
      CallanCustomerProfileRoutingModule,
      ReactiveFormsModule,
      CallanCustomerHeaderModule
  ],
  declarations: [
      CustomerProfileContainerComponent,
      CallanCustomerSelfDetailsComponent,
      CallanCustomerSelfViewComponent,
      CallanCustomerGoogleAuthComponent
  ],
})
export class CallanCustomerProfileModule { }
