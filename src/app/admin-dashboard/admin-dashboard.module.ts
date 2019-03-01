import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CallanActivityLogListComponent} from './activity-log-list/activity-log-list.component';
import {CallanAdminDashboardContainerComponent} from './admin-dashboard-container.component';
import {CallanAdminDashboardRoutingModule} from './admin-dashboard-routing.module';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppPipesModule} from '../shared-modules/pipes/pipes.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';


@NgModule({
    imports: [
        CommonModule,
        CallanAdminDashboardRoutingModule,
        NgxDatatableModule,
        FormsModule,
        ReactiveFormsModule,
        AppPipesModule,
        FlexLayoutModule,
        NgbModule
    ],
    declarations: [CallanAdminDashboardContainerComponent, CallanActivityLogListComponent]
})
export class CallanAdminDashboardModule {
}
