// import React from 'react';
export type { MenuItem, SubMenuItem, SubSubMenuItem } from '@od-erp/types';

export interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}
