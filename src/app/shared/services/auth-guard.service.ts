import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { Injectable } from '@angular/core';
import { CallanAuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
      private router: Router,
      private authService: CallanAuthService
  ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        console.log('Authenticated?', this.authService.isAuthenticated());
        if (this.authService.isAuthenticated()) {
            return true;
        } else {
            this.router.navigate(['/auth/login']);
            return false;
        }
    }
}
