import React from 'react';

export interface MenuItem {
    title: string;
    icon: React.ReactNode;
    page?: string;
    submenu?: SubMenuItem[];
}

export interface SubMenuItem {
    title: string;
    submenu?: SubSubMenuItem[];
    page?: string;
    fav?: boolean;
}

export interface SubSubMenuItem {
    title: string;
    page: string;
    fav?: boolean;
}

export interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}
