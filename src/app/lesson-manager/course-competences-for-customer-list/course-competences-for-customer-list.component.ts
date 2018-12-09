import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CallanCourseCompetence} from '../../shared/models/course-competence.model';

@Component({
  selector: 'app-course-competences-list',
  templateUrl: './course-competences-for-customer-list.component.html',
  styleUrls: ['./course-competences-for-customer-list.component.scss']
})
export class CallanCourseCompetencesForCustomerListComponent implements OnInit {

  @Input() courseSpecialities: CallanCourseCompetence[];

  @Input() isSpecialityControlsShown = false;

  @Output() courseSpecialityDeleteEvent = new EventEmitter<CallanCourseCompetence>();

  constructor() { }

  ngOnInit() {
  }

  handleCourseSpecialityDelete($event) {
    this.courseSpecialityDeleteEvent.next($event);
  }

}
