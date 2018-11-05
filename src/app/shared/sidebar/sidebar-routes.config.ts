
import { RouteInfo } from './sidebar.metadata';

// Sidebar menu Routes and data

// const ROUTES: RouteInfo[];



export const ROUTES: RouteInfo[] = [
     {
        path: '/customers', title: 'Customers', icon: 'ft-home', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: []
    },
    {
        path: '/lessons', title: 'Lessons', icon: 'icon-graduation', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: []
    },
    {
        path: '/schedule', title: 'Time Table', icon: 'ft-list', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: []
    }
];
