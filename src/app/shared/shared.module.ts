import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRouteSnapshot, RouterModule} from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CustomizerComponent } from './customizer/customizer.component';
import { NotificationSidebarComponent } from './notification-sidebar/notification-sidebar.component';
import { ToggleFullscreenDirective } from './directives/toggle-fullscreen.directive';
import { CallanLessonEventAnnouncementComponent} from './lesson-event-announcement/lesson-event-announcement.component';

@NgModule({
    exports: [
        CommonModule,
        FooterComponent,
        NavbarComponent,
        SidebarComponent,
        CustomizerComponent,
        NotificationSidebarComponent,
        ToggleFullscreenDirective,
        NgbModule,
        TranslateModule
    ],
    imports: [
        RouterModule,
        CommonModule,
        NgbModule,
        TranslateModule,
        // ActivatedRouteSnapshot
        // RouterModule.forRoot([]),
    ],
    declarations: [
        FooterComponent,
        NavbarComponent,
        CallanLessonEventAnnouncementComponent,
        SidebarComponent,
        CustomizerComponent,
        NotificationSidebarComponent,
        ToggleFullscreenDirective
    ]
})
export class SharedModule { }
