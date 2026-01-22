
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useMenu } from '@od-erp/store';
import { cn } from '../../utils';
import { getIconSrc } from './IconMapping';
import { LayoutDashboard } from 'lucide-react';
import { SidebarItem } from '../../global/SidebarItem';
import { SidebarExpansionPanel } from '../../global/SidebarExpansionPanel';

interface SidebarProps {
    className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
    const location = useLocation();
    const { menuItems } = useMenu();
    const [hoveredItem, setHoveredItem] = React.useState<any | null>(null);
    const leaveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clear timeout wrapper to ensure we don't close if entering another item or the panel
    const handleMouseEnter = (item: any) => {
        if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
            leaveTimeoutRef.current = null;
        }
        setHoveredItem(item);
    };

    const handleMouseLeave = () => {
        leaveTimeoutRef.current = setTimeout(() => {
            setHoveredItem(null);
        }, 100); // 100ms delay to match Angular legacy behavior
    };

    // Close panel when location changes (navigation occurred)
    React.useEffect(() => {
        setHoveredItem(null);
    }, [location.pathname]);

    React.useEffect(() => {
        return () => {
            if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
        };
    }, []);

    return (
        <>
            <aside
                className={cn(
                    "bg-white shadow-[0px_0px_20px_0px_rgba(76,87,125,0.02)] transition-all duration-300 z-20 flex flex-col fixed left-0 top-[80px] pb-20",
                    "w-[100px] border-r border-[#eff2f5]",
                    className
                )}
                style={{ height: 'calc(100vh - 80px)' }}
                onMouseLeave={handleMouseLeave}
            >
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-1 scrollbar-hide">
                    <ul className="flex flex-col gap-1 items-center w-full">
                        {menuItems && menuItems.map((item: any, index: number) => {
                            const isActive = location.pathname === item.page || (item.page !== '/' && location.pathname.startsWith(`${item.page}`));
                            const isHovered = hoveredItem === item;
                            const iconSrc = getIconSrc(item.title, isActive || isHovered);

                            const iconNode = (
                                <div className="w-8 h-8 flex items-center justify-center">
                                    {iconSrc ? (
                                        <lord-icon
                                            key={`${index}-${isActive}-${isHovered}`}
                                            src={iconSrc}
                                            trigger="hover"
                                            colors={`primary:${isActive || isHovered ? '#5d78ff' : '#b8bac3'}`}
                                            style={{ width: '25px', height: '25px' }}
                                        />
                                    ) : (
                                        <LayoutDashboard className={`w-5 h-5 ${isActive ? 'text-[#5d78ff]' : 'text-[#b8bac3]'}`} />
                                    )}
                                </div>
                            );

                            const adaptedItem = { ...item, icon: iconNode };

                            return (
                                <li key={index} className="w-full px-2">
                                    <SidebarItem
                                        item={adaptedItem}
                                        collapsed={false} // Always show title below icon
                                        isActive={isActive}
                                        isHovered={isHovered}
                                        onMouseEnter={() => handleMouseEnter(item)}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </aside>

            {/* Expansion Panel (Recursive Submenu) */}
            <SidebarExpansionPanel
                item={hoveredItem}
                onMouseEnter={() => {
                    if (leaveTimeoutRef.current) {
                        clearTimeout(leaveTimeoutRef.current);
                        leaveTimeoutRef.current = null;
                    }
                }}
                onMouseLeave={handleMouseLeave}
            />
        </>
    );
};
