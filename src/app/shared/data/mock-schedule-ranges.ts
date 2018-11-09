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
range1.endMinutes = 20 * 60;

const range2 = new CallanScheduleRange();
range2.id = 2;
range2.dayOfWeek = 1;
range2.regularity = CallanScheduleRangeRegularityEnum.REGULAR;
range2.type = CallanScheduleRangeTypeEnum.INCLUSIVE;
range2.startMinutes = 17 * 60;
range2.endMinutes = 22 * 60;


const range3 = new CallanScheduleRange();
range3.id = 3;
range3.dayOfWeek = 1;
range3.regularity = CallanScheduleRangeRegularityEnum.REGULAR;
range3.type = CallanScheduleRangeTypeEnum.INCLUSIVE;
range3.startMinutes = 22 * 60;
range3.endMinutes = 23 * 60 + 45;

mockScheduleRanges.push(range1);
mockScheduleRanges.push(range2);
// mockScheduleRanges.push(range3);

export { mockScheduleRanges };
