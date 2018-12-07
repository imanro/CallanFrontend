import {Injectable} from '@angular/core';

import {CallanBaseService} from './base.service';
import {CallanActivityLog} from '../models/activity-log.model';
import {Observable} from 'rxjs';
import {CallanActivityLogActionEnum} from '../enums/activity-log.action.enum';
import {CallanLessonService} from './lesson.service';
import {CallanActivityLogItemKindEnum} from '../enums/activity-log.item-kind.enum';

@Injectable()
export abstract class CallanActivityLogService extends CallanBaseService {

    static createActivityLog(): CallanActivityLog {
        return new CallanActivityLog();
    }

    static parseMessage(message: string): string {
        const matches = message.match(/\{.+?\}/g);

        if (matches) {
            for (const token of matches) {
                const [name, value] = this.parseToken(token);
                switch (name) {
                    case('state'):
                        message = message.replace(token, '<code>[' + CallanLessonService.getLessonEventStateName(Number(value)) + ']</code>');
                        break;
                    case('customer'):
                        message = message.replace(token, '[' + this.getItemPreviewLink(value, 'customer', 'Customer') + ']');
                        break;
                }
            }
        }
        return message;
    }

    static getItemPreviewLink(id, kind, title?) {
        if (!title) {
            title = 'Details';
        }

        return '<a href="javascript:;" data-item-kind="' + kind + '" data-item-id="' + id + '">' + title + '</a>'
    }

    static parseToken(token: string): string[] {
        return token.replace(/[{}]/g, '').split(/:\s+/);
    }

    static getActivityLogActionName(value: string): string {
        switch (value) {
            default:
                value = value.replace(/_/g, ' ').toLowerCase();
                return value.charAt(0).toUpperCase() + value.slice(1)
        }
    }

    static getItemKindByAction(action: string): string {
        switch (action) {
            case(CallanActivityLogActionEnum.LESSON_EVENT_CREATE):
            case(CallanActivityLogActionEnum.LESSON_EVENT_STATUS_CHANGE):
            case(CallanActivityLogActionEnum.LESSON_EVENT_AUTO_STATUS_CHANGE):
            case(CallanActivityLogActionEnum.LESSON_EVENT_TEACHER_ASSIGNMENT):
                return CallanActivityLogItemKindEnum.LESSON_EVENT;

            case(CallanActivityLogActionEnum.BALANCE_SPEND):
            case(CallanActivityLogActionEnum.BALANCE_REFUND):
                return CallanActivityLogItemKindEnum.LESSON_EVENT;

            case(CallanActivityLogActionEnum.BALANCE_CHANGE):
                return CallanActivityLogItemKindEnum.COURSE_PROGRESS;

            case(CallanActivityLogActionEnum.CUSTOMER_CREATE):
            case(CallanActivityLogActionEnum.CUSTOMER_UPDATE):
                return CallanActivityLogItemKindEnum.CUSTOMER;

            default:
                return null;

        }
    }

    abstract getActivityLogItems(limit?, offset?): Observable<CallanActivityLog[]>;

    abstract findActivityLogItems(term?: string, affectedId?: number, initiatorId?: number, limit?, offset?): Observable<CallanActivityLog[]>;

    abstract getActivityLogItemsCount(term?: string, affectedId?: number, initiatorId?: number): Observable<number>;

    abstract mapDataToActivityLog(activityLogItem: CallanActivityLog, row: any): void;
}
