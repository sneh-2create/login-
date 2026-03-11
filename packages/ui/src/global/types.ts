// import React from 'react';
export type { MenuItem, SubMenuItem, SubSubMenuItem } from '@od-erp/types';
// Re-export or define UI specific ones if needed

export interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}
