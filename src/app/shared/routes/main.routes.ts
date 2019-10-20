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
    },
    {
        path: 'schedule',
        loadChildren: './schedule-manager/schedule-manager.module#CallanScheduleManagerModule'
    },
    {
        path: 'profile',
        loadChildren: './customer-profile/customer-profile.module#CallanCustomerProfileModule'
    },
    {
        path: 'admin-dashboard',
        loadChildren: './admin-dashboard/admin-dashboard.module#CallanAdminDashboardModule'
    }
];
