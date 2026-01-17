// import React from 'react';
export type { menuItem, subMenuItem, subSubMenuItem } from '@od-erp/types';

export interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}
