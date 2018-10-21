import { Routes, RouterModule } from '@angular/router';

// Route for content layout without sidebar, navbar and footer for pages like Login, Registration etc...

export const AUTH_ROUTES: Routes = [
    {
        path: 'auth',
        loadChildren: './auth/auth.module#CallanAuthModule'
    }
];
