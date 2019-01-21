import { Component, OnInit } from '@angular/core';
import { ROUTES } from './sidebar-routes.config';
import {combineLatest as observableCombineLatest} from 'rxjs';
import { Router, ActivatedRoute } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import {CallanAuthService} from '../services/auth.service';
import {CallanCustomerService} from '../services/customer.service';
import {CallanRoleNameEnum} from '../enums/role.name.enum';
import {environment} from '../../../environments/environment';
import {AppEnvironmentNameEnum} from '../enums/environment.name.enum';
import {AppConfig} from '../../app.config';

declare var $: any;

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
})

export class SidebarComponent implements OnInit {
    menuItems: any[] = [];

    environment: {name: string, title: string};
    environmentNameEnum: any;
    appVersion: string;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private authService: CallanAuthService,
        private customerService: CallanCustomerService,
        private appConfig: AppConfig,
        public translate: TranslateService,
    ) {
        this.environmentNameEnum = AppEnvironmentNameEnum;
        this.environment = environment;
        this.appVersion = this.appConfig.appVersion;
    }

    ngOnInit() {
        $.getScript('./assets/js/app-sidebar.js');

        this.customerService.getCurrentCustomer().subscribe(() => {
            //   call this to set current customer by default for admin
            observableCombineLatest(
                this.customerService.getAuthCustomer(),
                this.customerService.getCurrentCustomer$()
            ).subscribe(results => {
                const authCustomer = results[0];
                const currentCustomer = results[1];

                console.log('Now, current and auth:', authCustomer, currentCustomer);


                // clear menu items
                this.menuItems = [];

                const choosenRoutes = [];
                let routeTitleReplacement = {};

                if (CallanCustomerService.hasCustomerRole(authCustomer, CallanRoleNameEnum.ADMIN)) {
                    choosenRoutes.push(...['/customers', '/admin-dashboard']);
                    routeTitleReplacement = {'/lessons/student': 'Student Lessons', '/lessons/teacher': 'Teacher Lessons'}
                }

                if (CallanCustomerService.hasCustomerRole(authCustomer, CallanRoleNameEnum.STUDENT)) {
                    choosenRoutes.push(...['/lessons/student']);
                }

                if (CallanCustomerService.hasCustomerRole(authCustomer, CallanRoleNameEnum.TEACHER)) {
                    choosenRoutes.push(...['/lessons/teacher', '/schedule']);
                }


                if (CallanCustomerService.hasCustomerRole(authCustomer, CallanRoleNameEnum.SUPPORT)) {
                    choosenRoutes.push(...['/claims']);
                }

                for (const name of choosenRoutes) {
                    for (const route of ROUTES) {

                        if (name === route.path) {

                            if (routeTitleReplacement[name] !== undefined) {
                                route.title = routeTitleReplacement[name];
                            }

                            this.menuItems.push(route);
                        }
                    }
                }

                console.log('customer received');
            });
        });

        /*
        this.customerService.getAuthCustomer().subscribe(customer => {


        });
        */

        // this.menuItems = ROUTES.filter(menuItem => menuItem);
    }
}
