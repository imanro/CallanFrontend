import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-callan-customer-google-auth',
  templateUrl: './customer-google-auth.component.html',
  styleUrls: ['./customer-google-auth.component.scss']
})
export class CallanCustomerGoogleAuthComponent implements OnInit {

  @Input() isAuthorized: boolean;

  @Output() authorize = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  handleAuthorize() {
    this.authorize.next();
  }

}
