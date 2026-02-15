import React, { useState } from 'react';
import { useSession, useAppDispatch, logout } from '@od-erp/store';
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
}

export const Header: React.FC<HeaderProps> = ({ className, isSidebarExpanded, onToggleSidebar }) => {
    // ... existing hooks ...
    const { session } = useSession();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [showSearchExpanded, setShowSearchExpanded] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);


    // ... variables ...
    const userName = session?.user?.name || "User";
    const userRole = session?.user?.role || "Admin";
    const quickActionIcon = "https://cdn.lordicon.com/mwzdatpw.json";

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
                "h-[80px] bg-[var(--header-bg)] flex items-center justify-between px-6 transition-all duration-300",
                "border-b border-[var(--header-border)] shadow-md z-[58]",
                className
            )}
        >
            <div className="flex items-center gap-4">
                {/* Sidebar Toggle */}
                {onToggleSidebar && (
                    <button
                        onClick={onToggleSidebar}
                        className="p-2 rounded-md hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] transition-colors"
                    >
                        {isSidebarExpanded ? <ChevronLeft size={24} /> : <Menu size={24} />}
                    </button>
                )}


            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
                {/* Expandable Search */}
                <div className="relative">
                    {!showSearchExpanded ? (
                        // Collapsed: Search Icon
                        <button
                            onClick={() => setShowSearchExpanded(true)}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-muted)] transition-colors text-[var(--color-foreground)]"
                        >
                            <SearchIcon size={20} />
                        </button>
                    ) : (
                        // Expanded: Search Input
                        <div className="flex items-center gap-2 bg-[var(--color-background)] border-2 border-[var(--color-primary)] rounded-full px-4 py-2 min-w-[300px] animate-in fade-in slide-in-from-right-2">
                            <SearchIcon size={18} color="var(--color-primary)" />
                            <input
                                type="text"
                                placeholder="Search students, fees, reports..."
                                className="flex-1 outline-none text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] bg-transparent"
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
                <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-muted)] transition-colors text-[var(--color-foreground)] relative">
                    <BellIcon size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Create Ticket Button */}
                <button className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-all">
                    <PlusIcon size={16} />
                    Create Ticket
                </button>

                <div
                    className="relative cursor-pointer w-[40px] h-[40px] flex items-center justify-center rounded-full hover:bg-[var(--color-muted)] transition-colors"
                    onMouseEnter={() => setShowQuickActions(true)}
                    onMouseLeave={() => setShowQuickActions(false)}
                >
                    <lord-icon
                        src={quickActionIcon}
                        trigger="hover"
                        colors={`primary:${iconColor},secondary:${iconColor}`}
                        style={{ width: '30px', height: '30px' }}
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

                {/* Theme Switcher */}
                <ThemeSwitcher />

                {/* Profile Dropdown */}
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
            </div>
        </header>
    );
};

