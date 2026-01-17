import React from 'react';
import { Link } from 'react-router-dom';
import { menuItem } from './types';

interface SidebarItemProps {
    item: menuItem;
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

    const baseClasses = `flex flex-col items-center gap-1 px-1 py-2 rounded-lg transition-all duration-200 cursor-pointer min-h-[70px] justify-center`;
    const activeClasses = `bg-[#f0f3ff] text-[#5d78ff] font-bold`;
    const inactiveClasses = `text-[#9899ac] hover:bg-[#f8f9fa] hover:text-[#5d78ff] font-medium`;
    const hoverClasses = isHovered && collapsed ? `bg-[#f0f3ff] text-[#5d78ff]` : inactiveClasses;

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
                    <span className="text-[11px] leading-tight tracking-wide text-center">{item.title}</span>
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
                <span className="text-[11px] leading-tight tracking-wide text-center">{item.title}</span>
            )}
        </div>
    );
};
