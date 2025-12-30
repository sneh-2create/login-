import { ReactNode } from 'react';
// --- Auth Types ---
export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    userType: string;
    employeeId?: string;
    permissions?: string[];
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
