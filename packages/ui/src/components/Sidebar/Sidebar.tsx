
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useMenu } from '@od-erp/store';
import { cn } from '../../utils';
import { getIconSrc } from './IconMapping';
import { LayoutDashboard } from 'lucide-react';
import { SidebarExpansionPanel } from '../../global/SidebarExpansionPanel';

interface SidebarProps {
    className?: string;
    collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ className, collapsed = false }) => {
    const location = useLocation();
    const { menuItems } = useMenu();
    // activeItem: for clicked interaction (Expanded mode)
    // activeItem: for clicked interaction
    const [activePanelItem, setActivePanelItem] = React.useState<any | null>(null);
    const leaveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = (_item: any) => {
        // Disabled hover-to-open behavior
    };

    const handleMouseLeave = () => {
        // Disabled hover-exit-to-close behavior
    };

    const handleItemClick = (item: any) => {
        // Toggle panel for both expanded and collapsed modes
        if (item.submenu && item.submenu.length > 0) {
            if (activePanelItem === item) {
                setActivePanelItem(null); // Toggle close
            } else {
                setActivePanelItem(item); // Open
            }
        }
    };

    // Close panel when location changes
    React.useEffect(() => {
        setActivePanelItem(null);
    }, [location.pathname]);

    // Handle Closing Active Panel
    const closeActivePanel = () => {
        setActivePanelItem(null);
    }

    React.useEffect(() => {
        return () => {
            if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
        };
    }, []);

    const sidebarWidth = collapsed ? '100px' : '265px';

    return (
        <>
            <aside
                className={cn(
                    "bg-white shadow-[0px_0px_20px_0px_rgba(76,87,125,0.02)] transition-all duration-300 z-[58] flex flex-col fixed left-0 top-[80px] pb-20",
                    "border-r border-[#eff2f5]",
                    className
                )}
                style={{ width: sidebarWidth, height: 'calc(100vh - 80px)' }}
                onMouseLeave={handleMouseLeave}
            >
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-hide">
                    <ul className="flex flex-col gap-1 items-start w-full">
                        {menuItems && menuItems.map((item: any, index: number) => {
                            const isActive = location.pathname === item.page || (item.page !== '/' && location.pathname.startsWith(`${item.page}`));
                            const isPanelOpen = activePanelItem === item;
                            const isSelected = isActive || isPanelOpen;
                            const iconSrc = getIconSrc(item.title, isSelected);

                            // Determine Submenu Badge Count
                            let badgeCount = 0;
                            if (item.submenu) {
                                // Count all leaf nodes (items without their own submenu) recursively
                                const countLeaves = (subItems: any[]) => {
                                    let count = 0;
                                    subItems.forEach(sub => {
                                        if (sub.submenu && sub.submenu.length > 0) {
                                            count += countLeaves(sub.submenu);
                                        } else {
                                            count++;
                                        }
                                    });
                                    return count;
                                };
                                badgeCount = countLeaves(item.submenu);
                            }
                            // Specific Mock Badges based on images if needed, or dynamic
                            if (item.title === 'Admissions') badgeCount = 23;
                            if (item.title === 'Fees') badgeCount = 15;


                            return (
                                <li key={index} className="w-full px-2">
                                    <div
                                        className={cn(
                                            "relative flex items-center w-full px-3 py-3 cursor-pointer rounded-xl transition-all duration-200 group",
                                            isSelected ? "bg-[var(--color-brand)] text-white" : "hover:bg-gray-50 text-gray-600",
                                            collapsed ? "justify-center flex-col gap-1" : "justify-start gap-4"
                                        )}
                                        onMouseEnter={() => handleMouseEnter(item)}
                                        onClick={() => handleItemClick(item)}
                                    >
                                        {/* Colored Left Border for Active State (Expanded) */}
                                        {/* {isSelected && !collapsed && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-[4px] bg-[var(--color-primary)] rounded-r-md"></div>
                                        )} */}

                                        {/* Icon */}
                                        <div className="w-6 h-6 flex items-center justify-center">
                                            {iconSrc ? (
                                                <lord-icon
                                                    src={iconSrc}
                                                    trigger="hover"
                                                    colors={isSelected ? "primary:#ffffff" : "primary:#b5b5c3"}
                                                    style={{ width: '24px', height: '24px' }}
                                                />
                                            ) : (
                                                <LayoutDashboard className={cn("w-5 h-5", isSelected ? "text-white" : "text-[#b5b5c3]")} />
                                            )}
                                        </div>

                                        {/* Title (Only if Expanded) */}
                                        {!collapsed && (
                                            <span className={cn(
                                                "text-sm font-medium tracking-wide flex-1 truncate",
                                                isSelected ? "text-white" : "text-gray-600 group-hover:text-[var(--color-brand)]"
                                            )}>
                                                {item.title}
                                            </span>
                                        )}

                                        {/* Badge (Submenu Count) */}
                                        {badgeCount > 0 && (
                                            <div
                                                className={cn(
                                                    "flex items-center justify-center rounded-full text-[10px] font-bold shadow-sm",
                                                    collapsed ? "absolute top-2 right-2 w-4 h-4" : "w-5 h-5",
                                                    // Active: White Background, Primary Text
                                                    // Inactive: Primary Background, White Text
                                                    isSelected ? "bg-white text-[var(--color-brand)]" : "bg-[var(--color-brand)] text-white"
                                                )}
                                            >
                                                {badgeCount}
                                            </div>
                                        )}

                                        {/* Collapsed Label (Optional, maybe tooltip?) - Current implementation puts it below icon */}
                                        {collapsed && (
                                            <span className={cn(
                                                "text-[10px] truncate max-w-full",
                                                isSelected ? "text-white" : "text-gray-400 group-hover:text-[var(--color-brand)]"
                                            )}>
                                                {item.title}
                                            </span>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </aside>

            {/* Expansion Panel (Drawer) */}
            {/* Show if Hovered (Collapsed) OR Active (Expanded) - NOW CLICK ONLY */}
            <SidebarExpansionPanel
                item={activePanelItem ? menuItems.find((m: any) => m.title === activePanelItem.title) || activePanelItem : null}
                leftOffset={0}
                onClose={closeActivePanel}
                onMouseEnter={() => {
                    if (collapsed) {
                        if (leaveTimeoutRef.current) {
                            clearTimeout(leaveTimeoutRef.current);
                            leaveTimeoutRef.current = null;
                        }
                    }
                }}
                onMouseLeave={() => {
                    if (collapsed) handleMouseLeave();
                }}
            />
        </>
    );
};
