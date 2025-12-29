export const ROLES = {
    ADMIN: 'admin',
    STUDENT: 'student',
    TEACHER: 'teacher',
    PARENT: 'parent',
} as const;

export const PERMISSIONS = {
    VIEW_DASHBOARD: 'view_dashboard',
    EDIT_PROFILE: 'edit_profile',
} as const;

export * from './menu.config';
export * from './dashboard.config';
export * from './ui.config';
