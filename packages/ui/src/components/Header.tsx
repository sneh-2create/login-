import React, { useState, useEffect } from 'react';
import { useSession, useAppDispatch, useAppSelector, logout } from '@od-erp/store';
import { User, LogOut, Menu, ChevronLeft, X } from 'lucide-react';
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
    const { session } = useSession();
    const dispatch = useAppDispatch();
    const { entityDetails } = useAppSelector((state: any) => state.auth);
    const navigate = useNavigate();

    const [showSearchExpanded, setShowSearchExpanded] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    
    // Window Resize logic
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isCompact = windowWidth < 1024;
    const isVeryCompact = windowWidth < 480;

    const userName = session?.user?.name || "User";
    const userRole = session?.user?.role || "Admin";
    const quickActionIcon = "https://cdn.lordicon.com/mwzdatpw.json";
    
    const logoUrl = entityDetails?.logo;
    const instituteName = entityDetails?.displayName || "OD ERP";

    const [iconColor, setIconColor] = React.useState('#1F2937');

    React.useEffect(() => {
        const updateIconColor = () => {
            const color = getComputedStyle(document.documentElement)
                .getPropertyValue('--color-foreground')
                .trim();
            setIconColor(color || '#1F2937');
        };

        updateIconColor();
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
                "bg-[var(--header-bg)] flex items-center justify-between transition-all duration-300 h-[70px] relative px-6",
                isMobile ? "px-2" : "px-6",
                "border-b border-[var(--header-border)] shadow-md z-[58]",
                className
            )}
        >
            {/* Search Overlay - Full Header Bar Container with clipping */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[70]">
                <div 
                    className={cn(
                        "absolute inset-0 bg-[var(--header-bg)] flex items-center px-4 md:px-8 transition-all duration-500 ease-in-out transform pointer-events-auto",
                        showSearchExpanded ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
                    )}
                >
                    <div className="flex-1 flex items-center gap-4 max-w-4xl mx-auto w-full bg-[var(--color-muted)]/30 rounded-lg px-3 py-1 border border-[var(--color-border)] shadow-inner">
                        <SearchIcon size={20} className="text-[var(--color-primary)]" />
                        <input
                            type="text"
                            placeholder="Search for anything..."
                            className="flex-1 bg-transparent border-none outline-none text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] text-base"
                            autoFocus={showSearchExpanded}
                        />
                        <button 
                            onClick={() => setShowSearchExpanded(false)}
                            className="p-2 hover:bg-[var(--color-muted)] rounded-full transition-colors text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Standard Header Content */}
            <div className={cn("flex items-center transition-all duration-300", isMobile ? "" : "gap-4", showSearchExpanded && "opacity-0 invisible")}>
                {/* Sidebar Toggle */}
                {onToggleSidebar && (
                    <button
                        onClick={onToggleSidebar}
                        className={cn(
                            "rounded-md hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] transition-colors",
                            isMobile ? "p-1" : "p-2"
                        )}
                    >
                        {isSidebarExpanded ? <ChevronLeft size={isMobile ? 22 : 24} /> : <Menu size={isMobile ? 22 : 24} />}
                    </button>
                )}

                {/* Mobile: Entity Logo & Name */}
                {(isMobile || isVeryCompact) && (
                    <div className="flex items-center gap-2">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
                        ) : (
                            <div className="h-8 w-8 bg-[var(--color-primary)] rounded-md flex items-center justify-center text-white font-bold text-xs">
                                {instituteName.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                        <span className="font-bold text-xs md:text-sm text-[var(--color-foreground)] leading-tight max-w-[150px] line-clamp-2">
                            {instituteName}
                        </span>
                    </div>
                )}
            </div>

            {/* Right Side */}
            <div className={cn("flex items-center transition-all duration-300", isMobile ? "gap-1" : "gap-3", showSearchExpanded && "opacity-0 invisible")}>
                {/* Search Trigger */}
                <button
                    onClick={() => setShowSearchExpanded(true)}
                    className={cn(
                        "flex items-center justify-center rounded-full hover:bg-[var(--color-muted)] transition-colors text-[var(--color-foreground)]",
                        isMobile ? "w-8 h-8" : "w-10 h-10"
                    )}
                >
                    <SearchIcon size={isMobile ? 18 : 20} />
                </button>

                {/* Academic Year Badge */}
                {!isCompact && (
                    <div className="flex items-center px-4 py-2 bg-[var(--color-muted)] rounded-full text-sm text-[var(--color-muted-foreground)] font-medium border border-[var(--color-border)]">
                        2024-2025
                    </div>
                )}

                {/* Notification Bell */}
                <button className={cn(
                    "flex items-center justify-center rounded-full hover:bg-[var(--color-muted)] transition-colors text-[var(--color-foreground)] relative",
                    isMobile ? "w-8 h-8" : "w-10 h-10"
                )}>
                    <BellIcon size={isMobile ? 18 : 20} />
                    <span className={cn(
                        "absolute bg-red-500 rounded-full border-2 border-[var(--header-bg)]",
                        isMobile ? "top-0 right-0 w-2.5 h-2.5" : "top-1 right-1 w-3 h-3"
                    )}></span>
                </button>

                {/* Create Ticket Button */}
                {!isCompact && (
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-all shadow-md active:scale-95">
                        <PlusIcon size={16} />
                        Create Ticket
                    </button>
                )}

                {/* Quick Actions */}
                <div
                    className={cn(
                        "relative cursor-pointer flex items-center justify-center rounded-full hover:bg-[var(--color-muted)] transition-colors",
                        isMobile ? "w-8 h-8" : "w-10 h-10"
                    )}
                    onMouseEnter={() => !isMobile && setShowQuickActions(true)}
                    onMouseLeave={() => !isMobile && setShowQuickActions(false)}
                    onClick={() => isMobile && setShowQuickActions(!showQuickActions)}
                >
                    <lord-icon
                        src={quickActionIcon}
                        trigger="hover"
                        colors={`primary:${iconColor},secondary:${iconColor}`}
                        style={{ width: isMobile ? '22px' : '28px', height: isMobile ? '22px' : '28px' }}
                    />

                    {showQuickActions && (
                        <div className="absolute top-full right-0 pt-2 w-64 z-[100]">
                            <div className="bg-[var(--color-card)] shadow-xl rounded-lg border border-[var(--color-border)] p-4 animate-in fade-in slide-in-from-top-2 origin-top-right">
                                <h5 className="text-sm font-bold text-[var(--color-foreground)] mb-2 border-b border-[var(--color-border)] pb-2">Quick Actions</h5>
                                <div className="space-y-2">
                                    <div className="p-2 hover:bg-[var(--sidebar-item-active-bg)] rounded cursor-pointer flex items-center gap-2 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-[var(--sidebar-item-active-bg)] flex items-center justify-center text-[var(--color-primary)] text-xs font-bold border border-[var(--color-border)]">IS</div>
                                        <div>
                                            <p className="text-xs font-bold text-[var(--color-foreground)]">Institute Setup</p>
                                            <p className="text-[10px] text-[var(--color-muted-foreground)]">Informative Details</p>
                                        </div>
                                    </div>
                                    <div className="p-2 hover:bg-[var(--sidebar-item-active-bg)] rounded cursor-pointer flex items-center gap-2 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-[var(--sidebar-item-active-bg)] flex items-center justify-center text-[var(--color-primary)] text-xs font-bold border border-[var(--color-border)]">FS</div>
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
                    <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[var(--color-primary)] rounded-md hover:opacity-90 transition-all shadow-sm active:scale-95">
                        <PlusIcon size={14} />
                        Create
                    </button>
                )}

                {/* Theme Switcher */}
                {(!isMobile && !isVeryCompact) && <ThemeSwitcher />}

                {/* Profile Dropdown */}
                {!isMobile && (
                    <div
                        className="relative"
                        onMouseEnter={() => setShowProfileMenu(true)}
                        onMouseLeave={() => setShowProfileMenu(false)}
                    >
                        <div className="ml-2 w-10 h-10 rounded-full bg-[var(--sidebar-item-active-bg)] flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all cursor-pointer shadow-sm border border-[var(--color-border)]">
                            <User size={20} />
                        </div>

                        {showProfileMenu && (
                            <div className="absolute top-full right-0 pt-2 w-56 z-[100]">
                                <div className="bg-[var(--color-card)] shadow-xl rounded-lg border border-[var(--color-border)] py-2 animate-in fade-in slide-in-from-top-2 origin-top-right">
                                    <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-muted)]/10">
                                        <p className="text-sm font-bold text-[var(--color-foreground)] truncate">{userName}</p>
                                        <p className="text-xs text-[var(--color-muted-foreground)] truncate capitalize font-medium">{userRole}</p>
                                    </div>

                                    <div className="py-1">
                                        <div className="px-4 py-2 hover:bg-[var(--sidebar-item-active-bg)] cursor-pointer flex items-center gap-2 text-sm text-[var(--color-foreground)] transition-colors">
                                            <User size={16} />
                                            <span>My Profile</span>
                                        </div>
                                        <div
                                            onClick={handleLogout}
                                            className="px-4 py-2 hover:bg-red-50 cursor-pointer flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
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

