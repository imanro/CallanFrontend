import { Component, Input, OnInit } from '@angular/core';
import {CallanCustomer} from '../../shared/models/customer.model';

@Component({
  selector: 'app-callan-customer-self-view',
  templateUrl: './customer-self-view.component.html',
  styleUrls: ['./customer-self-view.component.scss']
})
export class CallanCustomerSelfViewComponent implements OnInit {

  @Input() customer: CallanCustomer;

  constructor() { }

  ngOnInit() {
  }

  formatCustomerRoles(customer: CallanCustomer): string {
      const list = [];
      if (customer) {
          for (const item of customer.roles) {
              list.push(item.name);
          }
      }

      return list.join(', ');
  }

}
