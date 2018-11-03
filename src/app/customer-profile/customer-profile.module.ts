import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerProfileContainerComponent } from './customer-profile-container.component';
import { LessonBalanceComponent } from './lesson-balance.component';
import {CallanCustomerProfileRoutingModule} from './customer-profile-routing.module';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  imports: [
      CommonModule,
      CallanCustomerProfileRoutingModule,
      ReactiveFormsModule,
  ],
  declarations: [
      CustomerProfileContainerComponent,
      LessonBalanceComponent
  ],
})
export class CallanCustomerProfileModule { }
