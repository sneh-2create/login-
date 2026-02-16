import React, { useState } from 'react';
import { useSession, useAppDispatch, useAppSelector, logout } from '@od-erp/store';
import { User, LogOut, Menu, ChevronLeft } from 'lucide-react'; // Added icons
import { cn } from '../utils';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, BellIcon, PlusIcon } from './Icons/HeaderIcons';
import { ThemeSwitcher } from './ThemeSwitcher';

interface HeaderProps {
    className?: string;
    isSidebarExpanded?: boolean;
    onToggleSidebar?: () => void;
    isMobile?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ className, isSidebarExpanded, onToggleSidebar, isMobile = false }) => {
    // ... existing hooks ...
    const { session } = useSession();
    const dispatch = useAppDispatch();
    const { entityDetails } = useAppSelector((state: any) => state.auth);
    const navigate = useNavigate();

    const [showSearchExpanded, setShowSearchExpanded] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);


    // ... variables ...
    const userName = session?.user?.name || "User";
    const userRole = session?.user?.role || "Admin";
    const quickActionIcon = "https://cdn.lordicon.com/mwzdatpw.json";
    
    const logoUrl = entityDetails?.logo;
    const instituteName = entityDetails?.displayName || "OD ERP";

    // Compute foreground color for lord-icon (doesn't support CSS variables)
    const [iconColor, setIconColor] = React.useState('#1F2937');

    React.useEffect(() => {
        const updateIconColor = () => {
            const color = getComputedStyle(document.documentElement)
                .getPropertyValue('--color-foreground')
                .trim();
            setIconColor(color || '#1F2937');
        };

        updateIconColor();
        // Listen for theme changes
        const observer = new MutationObserver(updateIconColor);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme', 'class']
        });

        return () => observer.disconnect();
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        Cookies.remove('token');
        navigate('/login');
    };

    return (
        <header
            className={cn(
                "bg-[var(--header-bg)] flex items-center justify-between transition-all duration-300",
                isMobile ? "h-[70px] px-2" : "h-[80px] px-6",
                "border-b border-[var(--header-border)] shadow-md z-[58]",
                className
            )}
        >
            <div className={`flex items-center ${isMobile ? "" : "gap-4"}`}>
                {/* Sidebar Toggle */}
                {onToggleSidebar && (
                    <button
                        onClick={onToggleSidebar}
                        className={isMobile ? "p-1 rounded-md hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] transition-colors" : "p-2 rounded-md hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] transition-colors"}
                    >
                        {isSidebarExpanded ? <ChevronLeft size={isMobile ? 22 : 24} /> : <Menu size={isMobile ? 22 : 24} />}
                    </button>
                )}

                {/* Mobile: Entity Logo & Name */}
                {isMobile && (
                    <div className="flex items-center gap-2">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
                        ) : (
                            <div className="h-8 w-8 bg-[var(--color-primary)] rounded-md flex items-center justify-center text-white font-bold text-xs">
                                {instituteName.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                        <span className="font-bold text-xs md:text-sm text-[var(--color-foreground)] leading-tight max-w-[200px] line-clamp-3">
                            {instituteName}
                        </span>
                    </div>
                )}
            </div>

            {/* Right Side */}
            <div className={`flex items-center ${isMobile ? "gap-1" : "gap-3"}`}>
                {/* Expandable Search */}
                <div className="relative">
                    {!showSearchExpanded ? (
                        // Collapsed: Search Icon
                        <button
                            onClick={() => setShowSearchExpanded(true)}
                            className={isMobile ? "flex items-center justify-center rounded-full hover:bg-[var(--color-muted)] transition-colors text-[var(--color-foreground)]" : "w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-muted)] transition-colors text-[var(--color-foreground)]"}
                        >
                            <SearchIcon size={isMobile ? 18 : 20} />
                        </button>
                    ) : (
                        // Expanded: Search Input
                        <div className={cn(
                            "flex items-center gap-2 bg-[var(--color-background)] border-2 border-[var(--color-primary)] rounded-full px-4 py-2 animate-in fade-in slide-in-from-right-2",
                            isMobile ? "absolute right-0 top-0 w-[calc(100vw-80px)] z-50" : "min-w-[300px]"
                        )}>
                            <SearchIcon size={isMobile ? 16 : 18} color="var(--color-primary)" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="flex-1 outline-none text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] bg-transparent min-w-0"
                                autoFocus
                                onBlur={() => setShowSearchExpanded(false)}
                            />
                        </div>
                    )}
                </div>

                {/* Academic Year Badge */}
                <div className="hidden md:flex items-center px-4 py-2 bg-[var(--color-muted)] rounded-full text-sm text-[var(--color-muted-foreground)] font-medium border border-[var(--color-border)]">
                    2024-2025
                </div>

                {/* Notification Bell */}
                <button className={isMobile ? "flex items-center justify-center rounded-full hover:bg-[var(--color-muted)] transition-colors text-[var(--color-foreground)] relative" : "w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-muted)] transition-colors text-[var(--color-foreground)] relative"}>
                    <BellIcon size={isMobile ? 18 : 20} />
                    <span className={isMobile ? "absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" : "absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"}></span>
                </button>

                {/* Create Ticket Button (Desktop) */}
                <button className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-all">
                    <PlusIcon size={16} />
                    Create Ticket
                </button>

                <div
                    className={isMobile ? "relative cursor-pointer flex items-center justify-center rounded-full hover:bg-[var(--color-muted)] transition-colors" : "relative cursor-pointer w-[40px] h-[40px] flex items-center justify-center rounded-full hover:bg-[var(--color-muted)] transition-colors"}
                    onMouseEnter={() => setShowQuickActions(true)}
                    onMouseLeave={() => setShowQuickActions(false)}
                >
                    <lord-icon
                        src={quickActionIcon}
                        trigger="hover"
                        colors={`primary:${iconColor},secondary:${iconColor}`}
                        style={{ width: isMobile ? '25px' : '30px', height: isMobile ? '25px' : '30px' }}
                    />

                    {showQuickActions && (
                        <div className="absolute top-full right-0 pt-2 w-64 z-50">
                            <div className="bg-[var(--color-card)] shadow-xl rounded-lg border border-[var(--color-border)] p-4 animate-in fade-in slide-in-from-top-2 origin-top-right">
                                <h5 className="text-sm font-bold text-[var(--color-foreground)] mb-2 border-b border-[var(--color-border)] pb-2">Quick Actions</h5>
                                <div className="space-y-2">
                                    <div className="p-2 hover:bg-[var(--sidebar-item-active-bg)] rounded cursor-pointer flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-[var(--sidebar-item-active-bg)] flex items-center justify-center text-[var(--color-primary)] text-xs">IS</div>
                                        <div>
                                            <p className="text-xs font-bold text-[var(--color-foreground)]">Institute Setup</p>
                                            <p className="text-[10px] text-[var(--color-muted-foreground)]">Informative Details</p>
                                        </div>
                                    </div>
                                    <div className="p-2 hover:bg-[var(--sidebar-item-active-bg)] rounded cursor-pointer flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-[var(--sidebar-item-active-bg)] flex items-center justify-center text-[var(--color-primary)] text-xs">FS</div>
                                        <div>
                                            <p className="text-xs font-bold text-[var(--color-foreground)]">Fee Structure</p>
                                            <p className="text-[10px] text-[var(--color-muted-foreground)]">Fee Details</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Create Button */}
                {isMobile && (
                    <button className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-white bg-[var(--color-primary)] rounded-md hover:opacity-90 transition-all shadow-sm">
                        <PlusIcon size={16} />
                        Create
                    </button>
                )}

                {/* Theme Switcher - Hidden on Mobile */}
                {!isMobile && <ThemeSwitcher />}

                {/* Profile Dropdown - Hidden on Mobile */}
                {!isMobile && (
                    <div
                        className="relative"
                        onMouseEnter={() => setShowProfileMenu(true)}
                        onMouseLeave={() => setShowProfileMenu(false)}
                    >
                        <div className="ml-2 w-10 h-10 rounded-full bg-[var(--sidebar-item-active-bg)] flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors cursor-pointer">
                            <User size={20} />
                        </div>

                        {showProfileMenu && (
                            <div className="absolute top-full right-0 pt-2 w-56 z-50">
                                <div className="bg-[var(--color-card)] shadow-xl rounded-lg border border-[var(--color-border)] py-2 animate-in fade-in slide-in-from-top-2 origin-top-right">
                                    <div className="px-4 py-3 border-b border-[var(--color-border)]">
                                        <p className="text-sm font-bold text-[var(--color-foreground)] truncate">{userName}</p>
                                        <p className="text-xs text-[var(--color-muted-foreground)] truncate capitalize">{userRole}</p>
                                    </div>

                                    <div className="py-1">
                                        <div className="px-4 py-2 hover:bg-[var(--sidebar-item-active-bg)] cursor-pointer flex items-center gap-2 text-sm text-[var(--color-foreground)]">
                                            <User size={16} />
                                            <span>My Profile</span>
                                        </div>
                                        <div
                                            onClick={handleLogout}
                                            className="px-4 py-2 hover:bg-red-50 cursor-pointer flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                                        >
                                            <LogOut size={16} />
                                            <span>Sign Out</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

