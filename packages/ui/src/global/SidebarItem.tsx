import React from 'react';
import { Link } from 'react-router-dom';
import { MenuItem } from './types';

interface SidebarItemProps {
    item: MenuItem;
    collapsed: boolean;
    isActive: boolean;
    isHovered: boolean;
    onMouseEnter: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
    item,
    collapsed,
    isActive,
    isHovered,
    onMouseEnter,
}) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;

    const baseClasses = `flex flex-col items-center gap-1 px-3 py-3 rounded-lg transition-colors cursor-pointer`;
    const activeClasses = `bg-primary text-white`;
    const inactiveClasses = `text-gray-700 hover:bg-gray-100`;
    const hoverClasses = isHovered && collapsed ? activeClasses : inactiveClasses;

    if (item.page && !hasSubmenu) {
        return (
            <Link
                to={item.page}
                onMouseEnter={onMouseEnter}
                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                title={collapsed ? item.title : undefined}
            >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                    <span className="text-xs font-medium text-center">{item.title}</span>
                )}
            </Link>
        );
    }

    return (
        <div
            onMouseEnter={onMouseEnter}
            className={`${baseClasses} ${hoverClasses}`}
            title={collapsed ? item.title : undefined}
        >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && (
                <span className="text-xs font-medium text-center">{item.title}</span>
            )}
        </div>
    );
};
