import { Component, OnInit } from '@angular/core';
import { ROUTES } from './sidebar-routes.config';
import { RouteInfo } from "./sidebar.metadata";
import { Router, ActivatedRoute } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import {CallanAuthService} from '../services/auth.service';
import {CallanCustomerService} from '../services/customer.service';
import {CallanRoleNameEnum} from '../enums/role.name.enum';

declare var $: any;

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
})

export class SidebarComponent implements OnInit {
    public menuItems: any[] = [];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private authService: CallanAuthService,
        private customerService: CallanCustomerService,
        public translate: TranslateService
    ) {

    }

    ngOnInit() {
        $.getScript('./assets/js/app-sidebar.js');

        this.customerService.getAuthCustomer().subscribe(customer => {

            const choosenRoutes = [];

            if (CallanCustomerService.hasCustomerRole(customer, CallanRoleNameEnum.ADMIN)) {

                choosenRoutes.push(...['/customers', '/lessons', '/schedule']);

                console.log('will redirect to customers');
            } else if(CallanCustomerService.hasCustomerRole(customer, CallanRoleNameEnum.TEACHER)) {
                choosenRoutes.push(...['/lessons', '/schedule']);
            } else if (CallanCustomerService.hasCustomerRole(customer, CallanRoleNameEnum.STUDENT)) {
                choosenRoutes.push(...['/lessons']);
            } else if (CallanCustomerService.hasCustomerRole(customer, CallanRoleNameEnum.SUPPORT)) {
                choosenRoutes.push(...['/claims']);
            } else {
                choosenRoutes.push(...['/lessons']);
            }



            for (const name of choosenRoutes) {
                for (const route of ROUTES) {
                    if (name === route.path) {
                        this.menuItems.push(route);
                    }
                }
            }

            console.log('customer received');
        });

        // this.menuItems = ROUTES.filter(menuItem => menuItem);
    }

    //NGX Wizard - skip url change
    ngxWizardFunction(path: string) {
        if (path.indexOf('forms/ngx') !== -1)
            this.router.navigate(['forms/ngx/wizard'], { skipLocationChange: false });
    }
}
