import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-callan-nav-tabs',
  templateUrl: './nav-tabs.component.html',
  styleUrls: ['./nav-tabs.component.scss']
})
export class CallanNavTabsComponent implements OnInit {

  @Input() tabs: {[id: string]: string};

  @Input() activeTab: string;

  @Input() icon: string;

  @Input() iconOffset: {top: string, right: string, bottom: string, left: string};

  @Output() tabSelected = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  handleTabSelected(id: string) {
    this.tabSelected.next(id);
  }

}
