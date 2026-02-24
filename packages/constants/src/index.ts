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

export * from './admission';
export * from './alert.config';
export * from './badge.config';
export * from './dashboard.config';
export * from './documents';
export * from './menu.config';
export * from './notification-cta.config';
export * from './report.defaults';
export * from './table.config';
export * from './ui.config';
export * from './studentFields';
export * from './login.config';
export * from './theme.constants';
export * from './stageFields';
