import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import {CallanCustomer} from '../models/callan-customer.model';

@Injectable()
export class AuthService {

  private token: string;
  private authentificatedCustomer: CallanCustomer;

  constructor() {}

  isAuthenticated() {
    // here you can check if user is authenticated or not through his token
    return true;
  }

  getAuthentificatedCustomer()
  {
    return this.authentificatedCustomer;
  }
}
