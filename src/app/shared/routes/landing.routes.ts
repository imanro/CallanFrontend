import {Routes, RouterModule} from '@angular/router';

// Route for content layout with sidebar, navbar and footer.

export const LANDING_ROUTES: Routes = [
    {
        path: '',
        loadChildren: './landing/landing.module#CallanLandingModule',
        pathMatch: 'full',
    },
];
