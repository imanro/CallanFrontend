import {Routes, RouterModule} from '@angular/router';

// Route for content layout with sidebar, navbar and footer.

export const MAIN_ROUTES: Routes = [
    {
        path: 'customers',
        loadChildren: './customer-manager/customer-manager.module#CallanCustomerManagerModule'
    },
    {
        path: 'lessons',
        loadChildren: './lesson-manager/lesson-manager.module#CallanLessonManagerModule'
    }
];
