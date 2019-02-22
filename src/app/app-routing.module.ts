import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {FullLayoutComponent} from './layouts/full/full-layout.component';
import {ContentLayoutComponent} from './layouts/content/content-layout.component';

import {LANDING_ROUTES} from './shared/routes/landing.routes';
import {CABINET_ROUTES} from './shared/routes/cabinet.routes';
import {AUTH_ROUTES} from './shared/routes/auth.routes';

import {AuthGuard} from './shared/services/auth-guard.service';

const appRoutes: Routes = [
    {path: '',
        component: ContentLayoutComponent,
        data: {title: 'landing views'},
        children: LANDING_ROUTES
    },
    {
        path: '',
        component: FullLayoutComponent,
        data: {title: 'full Views'},
        children: CABINET_ROUTES,
        canActivate: [AuthGuard]
    },
    {path: '', component: ContentLayoutComponent, data: {title: 'auth views'}, children: AUTH_ROUTES},
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes, {onSameUrlNavigation: 'reload'})],
    exports: [RouterModule]
})

export class AppRoutingModule {
}