
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMenu, useSession, useAppSelector, useAppDispatch, logout } from '@od-erp/store';
import { cn } from '../../utils';
import { getIconSrc } from './IconMapping';
import { LayoutDashboard, LogOut, X } from 'lucide-react';
import { SidebarExpansionPanel } from '../../global/SidebarExpansionPanel';
import Cookies from 'js-cookie';

interface SidebarProps {
    className?: string;
    collapsed?: boolean;
    isMobile?: boolean;
    isOpen?: boolean;
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    className, 
    collapsed = false, 
    isMobile = false, 
    isOpen = true,
    onClose 
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { menuItems } = useMenu();
    const { session } = useSession();
    const { entityDetails } = useAppSelector((state) => state.auth);

    const [activePanelItem, setActivePanelItem] = React.useState<any | null>(null);
    const leaveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // Entity details
    const logoUrl = entityDetails?.logo;
    const instituteName = entityDetails?.displayName || "OD ERP";
    const userName = session?.user?.name || "User";
    const userRole = session?.user?.role || "Admin";
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    // Mobile: Always show as expanded
    const isExpandedView = !collapsed || isMobile;

    // Dynamic font size based on institute name length
    const getFontSize = (name: string) => {
        if (name.length > 40) return 'text-xs';
        if (name.length > 25) return 'text-sm';
        return 'text-base';
    };

    const handleMouseEnter = (_item: any) => {
        // Disabled hover-to-open behavior
    };

    const handleMouseLeave = () => {
        // Disabled hover-exit-to-close behavior
    };

    const handleItemClick = (item: any) => {
        // If item has submenu, toggle the expansion panel (don't navigate)
        if (item.submenu && item.submenu.length > 0) {
            if (activePanelItem === item) {
                setActivePanelItem(null);
            } else {
                setActivePanelItem(item);
            }
        } else if (item.page) {
            // If item has no submenu but has a page, navigate to it
            navigate(item.page);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        Cookies.remove('token');
        navigate('/login');
    };

    React.useEffect(() => {
        setActivePanelItem(null);
    }, [location.pathname]);

    const closeActivePanel = () => {
        setActivePanelItem(null);
    }

    React.useEffect(() => {
        return () => {
            if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
        };
    }, []);

    const sidebarWidth = isMobile ? '265px' : (collapsed ? '100px' : '265px');
    
    // Calculate transform for mobile
    const mobileTransform = isMobile 
        ? (isOpen ? 'translateX(0)' : 'translateX(-100%)')
        : 'none';

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobile && isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-[59] backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside
                className={cn(
                    "bg-[var(--sidebar-bg)] shadow-lg transition-all duration-300 z-[60] flex flex-col fixed left-0 top-0",
                    "border-r border-[var(--sidebar-border)]",
                    className
                )}
                style={{ 
                    width: sidebarWidth, 
                    height: '100vh',
                    transform: mobileTransform,
                }}
                onMouseLeave={handleMouseLeave}
            >
                {/* Fixed Header - Logo + Institute Name */}
                <div className={cn(
                    "border-b border-[var(--sidebar-border)] flex items-center transition-all duration-300 relative",
                    isExpandedView ? "h-[80px] px-2 py-3 justify-between" : "h-[80px] py-4 justify-center",
                    isMobile ? "h-[70px]" : "h-[80px]",
                )}>
                    {!isExpandedView ? (
                        // Collapsed: Show logo only (centered)
                        <div className="flex items-center justify-center">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="h-12 w-12 object-contain" />
                            ) : (
                                <div className="h-12 w-12 bg-[var(--color-primary)] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                    {instituteName.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                    ) : (
                        // Expanded: Show logo + institute name + Close Button (Mobile)
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3 overflow-hidden">
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Logo" className="h-10 w-10 object-contain flex-shrink-0" />
                                ) : (
                                    <div className="h-10 w-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                        {instituteName.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <h2 className={cn(
                                    "font-bold text-[var(--color-foreground)] leading-tight",
                                    isMobile ? "line-clamp-3 max-w-[150px]" : "flex-1",
                                    getFontSize(instituteName)
                                )}>
                                    {instituteName}
                                </h2>
                            </div>
                            
                            {/* Mobile Close Button */}
                            {isMobile && onClose && (
                                <button 
                                    onClick={onClose}
                                    className="p-1 rounded-md hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] transition-colors ml-2 flex-shrink-0"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Scrollable Menu Section */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-hide">
                    <ul className="flex flex-col gap-1 items-start w-full">
                        {menuItems && menuItems.map((item: any, index: number) => {
                            const isActive = location.pathname === item.page || (item.page !== '/' && location.pathname.startsWith(`${item.page}`));
                            const isPanelOpen = activePanelItem === item;
                            const isSelected = isActive || isPanelOpen;
                            const iconSrc = getIconSrc(item.title, isSelected);

                            // Determine Submenu Badge Count - recursively count all leaf items
                            let badgeCount = 0;
                            if (item.submenu) {
                                const countLeaves = (subItems: any[]): number => {
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

                            return (
                                <li key={index} className="w-full px-2">
                                    <div
                                        className={cn(
                                            "relative flex items-center w-full px-3 py-3 cursor-pointer rounded-xl transition-all duration-200 group",
                                            isSelected ? "bg-[var(--color-primary)] text-white" : "hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
                                            !isExpandedView ? "justify-center flex-col gap-1" : "justify-start gap-4"
                                        )}
                                        onMouseEnter={() => handleMouseEnter(item)}
                                        onClick={() => handleItemClick(item)}
                                    >
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
                                        {isExpandedView && (
                                            <span className={cn(
                                                "text-sm font-medium tracking-wide flex-1 truncate",
                                                isSelected ? "text-white" : "text-[var(--color-muted-foreground)] group-hover:text-[var(--color-primary)]"
                                            )}>
                                                {item.title}
                                            </span>
                                        )}

                                        {/* Badge (Submenu Count) */}
                                        {badgeCount > 0 && (
                                            <div
                                                className={cn(
                                                    "flex items-center justify-center rounded-full text-[10px] font-bold shadow-sm",
                                                    !isExpandedView ? "absolute top-2 right-2 w-4 h-4" : "w-5 h-5",
                                                    isSelected ? "bg-white text-[var(--color-primary)]" : "bg-[var(--color-primary)] text-white"
                                                )}
                                            >
                                                {badgeCount}
                                            </div>
                                        )}

                                        {/* Collapsed Label */}
                                        {!isExpandedView && (
                                            <span className={cn(
                                                "text-[10px] truncate max-w-full",
                                                isSelected ? "text-white" : "text-[var(--color-muted-foreground)] group-hover:text-[var(--color-primary)]"
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

                {/* Fixed Footer - User Details + Logout */}
                <div className={cn(
                    "border-t border-[var(--sidebar-border)] transition-all duration-300",
                    !isExpandedView ? "h-[70px] py-4" : "h-[80px] px-2 py-3",
                    isMobile ? "h-[70px] px-2" : "h-[80px]",
                )}>
                    {!isExpandedView ? (
                        // Collapsed: Show logout icon only (centered)
                        <div className="flex items-center justify-center h-full">
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-lg hover:bg-red-50 text-[var(--color-muted-foreground)] hover:text-red-600 transition-colors"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        // Expanded: Show user details + logout
                        <div className="flex items-center gap-3 w-full">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                {userInitials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[var(--color-foreground)] truncate">{userName}</p>
                                <p className="text-xs text-[var(--color-muted-foreground)] truncate capitalize">{userRole}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-lg hover:bg-red-50 text-[var(--color-muted-foreground)] hover:text-red-600 transition-colors flex-shrink-0"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Expansion Panel (Drawer) */}
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
                isMobile={isMobile}
            />
        </>
    );
};
