import {CallanScheduleRange} from '../models/schedule-range.model';
import {CallanScheduleRangeRegularityEnum} from '../enums/schedule-range.regularity.enum';
import {CallanScheduleRangeTypeEnum} from '../enums/schedule-range.type.enum';

const mockScheduleRanges: CallanScheduleRange[] = [];

const range1 = new CallanScheduleRange();
range1.id = 1;
range1.dayOfWeek = 1;
range1.regularity = CallanScheduleRangeRegularityEnum.REGULAR;
range1.type = CallanScheduleRangeTypeEnum.INCLUSIVE;
range1.startMinutes = 9 * 60;
range1.minutesAmount = 17;

const range2 = new CallanScheduleRange();
range2.id = 2;
range2.dayOfWeek = 1;
range2.regularity = CallanScheduleRangeRegularityEnum.REGULAR;
range2.type = CallanScheduleRangeTypeEnum.INCLUSIVE;
range2.startMinutes = 19 * 60;
range2.minutesAmount = 22;


const range3 = new CallanScheduleRange();
range3.id = 3;
range3.dayOfWeek = 1;
range3.regularity = CallanScheduleRangeRegularityEnum.REGULAR;
range3.type = CallanScheduleRangeTypeEnum.EXCLUSIVE;
range3.startMinutes = 13 * 60;
range3.minutesAmount = 45;

mockScheduleRanges.push(range1);
mockScheduleRanges.push(range2);
mockScheduleRanges.push(range3);

export { mockScheduleRanges };
