import { ReactNode } from 'react';
// --- Auth Types ---
export interface session {
    _id: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
}

export interface user {
    id: string;
    name: string;
    email: string;
    role: string;
    userType: string;
    employeeId?: string;
    permissions?: string[];
}

export interface entityDetails {
    id: string;
    logo?: string;
    displayName?: string;
    primaryColour?: string;
    secondaryColour?: string;
    qac?: string;
    activeSession?: any;
    entityPreferences?: any;
}

export interface authState {
    user: user | null;
    token: string | null;
    isAuthenticated: boolean;
    permissions: string[];
    preferences: any | null;
    entityDetails: entityDetails | null;
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
export interface menuItem {
    title: string;
    icon?: ReactNode | string; // Updated to allow string (legacy flaticon) or Node
    page?: string;
    submenu?: subMenuItem[];
    root?: boolean; // Legacy
    bullet?: string; // Legacy
    permission?: string; // Generic permission
    entPermission?: string; // Entity permission
    admPermission?: string; // Admin permission
}

export interface subMenuItem {
    title: string;
    submenu?: subSubMenuItem[];
    page?: string;
    fav?: boolean;
    bullet?: string;
    icon?: string; // Legacy
    entPermission?: string;
}

export interface subSubMenuItem {
    title: string;
    page: string;
    fav?: boolean;
    bullet?: string;
    entPermission?: string;
}

export * from './dashboard';
export * from './admission';
