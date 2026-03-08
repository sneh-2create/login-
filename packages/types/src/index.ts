import React, { ReactNode } from 'react';
// --- Auth Types ---
export interface Session {
    _id: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    userType: string;
    employeeId?: string;
    employee_id?: string; // Legacy support
    myOperatorId?: string;
    mobile?: string;
    permissions?: string[];
    entityGroup?: string[];
}

export interface EntityDetails {
    id: string;
    logo?: string;
    displayName?: string;
    primaryColour?: string;
    secondaryColour?: string;
    qac?: string;
    activeSession?: any;
    entityPreferences?: any;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    permissions: string[];
    preferences: any | null;
    entityDetails: EntityDetails | null;
}

// --- Dashboard Types ---
// --- Dashboard Types ---
export interface TabConfig {
    id: string;
    label: string;
    component: React.FC;
    permission: string;
}

// --- UI / Menu Types ---
export interface MenuItem {
    title: string;
    icon?: ReactNode | string; // Updated to allow string (legacy flaticon) or Node
    page?: string;
    submenu?: SubMenuItem[];
    root?: boolean; // Legacy
    bullet?: string; // Legacy
    permission?: string; // Generic permission
    entPermission?: string; // Entity permission
    admPermission?: string; // Admin permission
}

export interface SubMenuItem {
    title: string;
    submenu?: SubSubMenuItem[];
    page?: string;
    fav?: boolean;
    bullet?: string;
    icon?: string; // Legacy
    entPermission?: string;
}

export interface SubSubMenuItem {
    title: string;
    page: string;
    fav?: boolean;
    bullet?: string;
    entPermission?: string;
}

export * from './dashboard';
export * from './admission';
export * from './table';
export * from './library';

export * from './badge';
export * from './alert';
export * from './toast';
export * from './snackbar';
export * from './tooltip';
export * from './numberInput';
export * from './datePicker';
export * from './timePicker';
export * from './monthPicker';
export * from './yearPicker';
export * from './loader';
export * from './spinner';
export * from './progressBar';
export * from './dateRangePicker';
export * from './dateTimePicker';
export * from './popover';
export * from './modalOverlay';
export * from './modalBackdrop';
export * from './selectSingle';
export * from './multiSelect';
export * from './checkbox';
export * from './radio';
export * from './switch';
export * from './dropdownMenu';
export * from './autocomplete';
export * from './textArea';
export * from './hod';
export * from './communication';
export * from './analytics';
export * from './calendar';
export * from './profile';
export * from './examination';
export * from './mess';
export * from './login';
export * from './attendance';
export * from './employee';
export * from './theme.types';
export * from './excelTemplate';
export * from './feeMaster';
export * from './tabs';
export * from './pageToolbar';
export * from './accordion';
export * from './button';
