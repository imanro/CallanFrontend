import {Injectable} from '@angular/core';
import {CallanBaseService} from './base.service';
import {CallanCustomer} from '../models/customer.model';
import {CallanCustomerService} from './customer.service';
import {CallanRoleNameEnum} from '../enums/role.name.enum';

@Injectable()
export  class CallanUiService extends CallanBaseService {

    static getStudentAvatarColorsSet(): { bg: string, fg: string }[] {
        return [
            {bg: '#bbebf3', fg: '#000'},
            {bg: '#f0f4c3', fg: '#000'},
            {bg: '#ffe082', fg: '#000'},
            {bg: '#c5e1a5', fg: '#000'},
            {bg: '#f8bbd0', fg: '#000'},
            {bg: '#b2dfdb', fg: '#000'},
            ];
    }

    static getTeacherAvatarColorsSet(): { bg: string, fg: string }[] {
        return [
            {bg: '#795548', fg: '#fff'},
            {bg: '#e64a19', fg: '#fff'},
            {bg: '#64dd17', fg: '#fff'},
            {bg: '#0091ea', fg: '#fff'},
            {bg: '#ff4081', fg: '#fff'},
            {bg: '#9c27b0', fg: '#fff'},

        ];
    }

    static getCustomerAvatarsColors(customer: CallanCustomer, forceRole?: string): { bg: string, fg: string } {
        const numberFirst = customer.lastName ? customer.lastName.toLowerCase().charCodeAt(0) - 97 : 0;
        const numberLast = customer.firstName ? customer.firstName.toLowerCase().charCodeAt(0) - 97 : 0;

        let number = 0;

        if (numberFirst > numberLast) {
            number = numberFirst + numberLast;
        } else {
            // add entropy )
            number = numberFirst + numberLast + 3;
        }


        if (number < 0) {
            number = 0;
        }

        let pool = [];

         if (forceRole) {
             if ( forceRole === CallanRoleNameEnum.TEACHER) {
                 pool = CallanUiService.getTeacherAvatarColorsSet();
             } else {
                 pool = CallanUiService.getStudentAvatarColorsSet();
             }

         } else {
             if ( CallanCustomerService.hasCustomerRole(customer, CallanRoleNameEnum.TEACHER)) {
                 pool = CallanUiService.getTeacherAvatarColorsSet();
             } else {
                 pool = CallanUiService.getStudentAvatarColorsSet();
             }
         }


         // console.log('set number:', number % 6, pool[number % 6]);
         return pool[number % 6];
    }
}
