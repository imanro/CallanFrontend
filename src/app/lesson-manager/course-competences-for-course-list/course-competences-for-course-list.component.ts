import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CallanCourseCompetence} from '../../shared/models/course-competence.model';

@Component({
    selector: 'app-callan-course-competences-for-course-list',
    templateUrl: './course-competences-for-course-list.component.html',
    styleUrls: ['./course-competences-for-course-list.component.scss']
})
export class CallanCourseCompetencesForCourseListComponent implements OnInit {

    @Input() courseCompetences: CallanCourseCompetence[];

    @Output() selectCourseCompetenceEvent = new EventEmitter<CallanCourseCompetence>();

    selectedCourseCompetence: CallanCourseCompetence;

    constructor() {
    }

    ngOnInit() {
    }

    handleSelectCourseCompetence(competence: CallanCourseCompetence) {
        this.selectedCourseCompetence = competence;
        this.selectCourseCompetenceEvent.next(competence);
    }
}
