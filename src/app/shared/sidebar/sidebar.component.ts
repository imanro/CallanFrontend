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
import {CallanCustomer} from '../models/customer.model';
import {RouteInfo} from './sidebar.metadata';
import * as _ from 'lodash';

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
    currentCustomer: CallanCustomer;

    private ROUTES_HOLD: RouteInfo[] = [];

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

        this.ROUTES_HOLD = _.cloneDeep(ROUTES);
        $.getScript('./assets/js/app-sidebar.js');

        this.customerService.getCurrentCustomer().subscribe(() => {
            console.log('changed');
            //   call this to set current customer by default for admin
            observableCombineLatest(
                this.customerService.getAuthCustomer(),
                this.customerService.getCurrentCustomer$()
            ).subscribe(results => {
                const authCustomer = results[0];
                this.currentCustomer = results[1];

                console.log('Now, current and auth:', authCustomer, this.currentCustomer);


                // clear menu items
                this.menuItems = [];

                const choosenRoutes = [];
                let routeTitleReplacement = {};

                let checkCustomer;
                if (CallanCustomerService.hasCustomerRole(authCustomer, CallanRoleNameEnum.ADMIN)) {
                    checkCustomer = this.currentCustomer;
                } else {
                    checkCustomer = authCustomer;
                }

                if (CallanCustomerService.hasCustomerRole(checkCustomer, CallanRoleNameEnum.ADMIN)) {
                    // admin-specific (auth user check)
                    choosenRoutes.push(...['/customers', '/admin-dashboard']);
                }

                if (CallanCustomerService.hasCustomerRole(checkCustomer, CallanRoleNameEnum.STUDENT)) {
                    choosenRoutes.push(...['/lessons/student']);
                }

                if (CallanCustomerService.hasCustomerRole(checkCustomer, CallanRoleNameEnum.TEACHER)) {
                    choosenRoutes.push(...['/lessons/teacher', '/schedule']);
                }

                // if customer has both roles
                if (CallanCustomerService.hasCustomerRole(checkCustomer, CallanRoleNameEnum.STUDENT) && CallanCustomerService.hasCustomerRole(checkCustomer, CallanRoleNameEnum.TEACHER)) {
                    console.log('this case!!');
                    routeTitleReplacement = {
                        '/lessons/student': 'Student Lessons',
                        '/lessons/teacher': 'Teacher Lessons'
                    }
                }


                if (CallanCustomerService.hasCustomerRole(checkCustomer, CallanRoleNameEnum.SUPPORT)) {
                    choosenRoutes.push(...['/claims']);
                }

                for (const name of choosenRoutes) {
                    for (const i in ROUTES) {

                        if (ROUTES.hasOwnProperty(i)) {
                            const route = ROUTES[i];
                            const route_hold = this.ROUTES_HOLD[i];

                            if (name === route.path) {

                                if (routeTitleReplacement[name] !== undefined) {
                                    route.title = routeTitleReplacement[name];
                                } else {
                                    route.title = route_hold.title;
                                }

                                this.menuItems.push(route);
                            }
                        }
                    }
                }
            });
        });

        /*
        this.customerService.getAuthCustomer().subscribe(customer => {


        });
        */

        // this.menuItems = ROUTES.filter(menuItem => menuItem);
    }
}
