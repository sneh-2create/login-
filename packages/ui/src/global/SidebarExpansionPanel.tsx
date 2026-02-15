import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuItem, SubMenuItem } from './types';
import { useAppSelector, useAppDispatch, updatePreferences } from '@od-erp/store';
import { commonService } from '@od-erp/api-client';
import { getIconSrc } from '../components/Sidebar/IconMapping';
import { X, Bookmark, LayoutDashboard } from 'lucide-react';

interface SidebarExpansionPanelProps {
    item: MenuItem | null;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    leftOffset?: number;
    onClose?: () => void;
    isMobile?: boolean;
}


// Helper component for rendering a column of submenu items
const SubMenuColumn: React.FC<{
    items: SubMenuItem[];
    isActive: (_path?: string) => boolean;
    onLinkClick: () => void;
    onFavorite: (_e: React.MouseEvent, _item: SubMenuItem) => void;
    useMultiColumn?: boolean;
}> = ({ items, isActive, onLinkClick, onFavorite, useMultiColumn = false }) => {
    return (
        <div
            className={useMultiColumn ? "gap-0" : "flex flex-col gap-0 flex-1 min-w-0"}
            style={useMultiColumn ? {
                columnCount: 2,
                columnGap: '24px',
                columnFill: 'balance'
            } : undefined}
        >
            {items.map((category, catIndex) => (
                <div key={catIndex} className="break-inside-avoid w-full">
                    {/* Logic Match: Only show Title if it is a Group (has submenu) */}
                    {category.submenu && category.submenu.length > 0 ? (
                        <>
                            {/* Section Title - Darker, 12px, Uppercase */}
                            {category.title && (
                                <div className="submenuSectionTitle text-[12px] font-semibold text-[var(--sidebar-section-title)] uppercase tracking-wider mb-2">
                                    <span>{category.title}</span>
                                </div>
                            )}

                            {/* Submenu Items (Level 3) */}
                            <ul className="flex flex-col gap-0">
                                {category.submenu.map((subItem: any, subIndex: number) => {
                                    const active = isActive(subItem.page);
                                    return (
                                        <li key={subIndex} className="relative group/item">
                                            <Link
                                                to={subItem.page || '#'}
                                                onClick={onLinkClick}
                                                className={`
                                                    block w-full
                                                    py-3 pl-4 pr-10
                                                    text-[14px]
                                                    transition-all duration-300
                                                    ${active
                                                        ? 'text-[var(--color-brand)] font-medium'
                                                        : 'text-[#5e6278] hover:text-[var(--color-brand)]'
                                                    }
                                                `}
                                            >
                                                <span className="whitespace-normal leading-tight break-words">{subItem.title}</span>
                                            </Link>
                                            {/* Favorite Icon */}
                                            <div
                                                onClick={(e) => onFavorite(e, subItem)}
                                                className="flex items-center justify-center absolute top-0 right-0 h-full px-[10px] z-[2]"
                                            >
                                                <Bookmark
                                                    size={18}
                                                    className={subItem.fav ? "fill-[var(--color-brand)] text-[var(--color-brand)]" : "text-gray-300 hover:text-[var(--color-brand)]"}
                                                />
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </>
                    ) : (
                        /* Leaf Node (Level 2 Item) */
                        <div className="relative group/item">
                            <Link
                                to={category.page || '#'}
                                onClick={onLinkClick}
                                className={`
                                    block w-full
                                    py-3 pl-2 pr-10
                                    text-[14px]
                                    transition-all duration-300
                                    ${isActive(category.page)
                                        ? 'text-[#5d78ff] font-medium'
                                        : 'text-[#5e6278] hover:text-[#5d78ff]'
                                    }
                                `}
                            >
                                <span className="whitespace-normal leading-tight break-words">{category.title}</span>
                            </Link>
                            {/* Favorite Icon */}
                            <div
                                onClick={(e) => onFavorite(e, category)}
                                className="flex items-center justify-center absolute top-0 right-0 h-full px-[10px] z-[2]"
                            >
                                <Bookmark
                                    size={18}
                                    className={category.fav ? "fill-[#5d78ff] text-[#5d78ff]" : "text-gray-300 hover:text-[#5d78ff]"}
                                />
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export const SidebarExpansionPanel: React.FC<SidebarExpansionPanelProps> = ({
    item,
    onMouseEnter,
    onMouseLeave,
    leftOffset = 100,
    onClose,
    isMobile=false
}) => {
    if (!item || !item.submenu) return null;

    const dispatch = useAppDispatch();
    const { preferences } = useAppSelector((state) => state.auth);

    // Active State Logic
    const location = useLocation();
    const isActive = (path?: string) => {
        if (!path) return false;
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    // Animation State
    const [isVisible, setIsVisible] = React.useState(false);
    React.useEffect(() => {
        // Trigger animation frame
        requestAnimationFrame(() => {
            setIsVisible(true);
        });
    }, []);

    // Close panel on click
    const handleLinkClick = () => {
        onMouseLeave(); // Reuse leave handler to clear hover/close panel
    };

    const handleFavorite = async (e: React.MouseEvent, clickedItem: any) => {
        e.preventDefault();
        e.stopPropagation();

        if (!preferences) return; // Should not happen if logged in

        const currentFavs = preferences.favourites || [];
        const isAlreadyFav = currentFavs.some((f: any) => f.name === clickedItem.title);

        let newFavs;

        if (isAlreadyFav) {
            // Remove
            newFavs = currentFavs.filter((f: any) => f.name !== clickedItem.title);
        } else {
            // Add
            // Logic to determine pageType (legacy parity)
            const staticFavouriteList = ['Analysis Dashboard', 'Fee Collection', 'Fee Defaulter', 'Attendance Report', 'Admission Report'];
            const isReport = clickedItem.title.includes('Report') ||
                clickedItem.title === 'Result At A Glance' ||
                staticFavouriteList.includes(clickedItem.title);

            const newFavObj = {
                name: clickedItem.title,
                pageType: isReport ? 'report' : 'action',
                route: clickedItem.page
            };
            newFavs = [...currentFavs, newFavObj];
        }

        const updatedPreferences = { ...preferences, favourites: newFavs };

        try {
            // 1. Optimistic Update in Store (UI reflects immediately via useMenu)
            dispatch(updatePreferences(updatedPreferences));

            // 2. Persist to Backend
            await commonService.editUserPreferences(updatedPreferences);
            // Optionally, we could dispatch again with server response if needed, 
            // but typical pattern here is optimistic is fine.
        } catch (error) {
            console.error('Failed to update favorites:', error);
            // Revert on error
            dispatch(updatePreferences(preferences));
        }
    };

    // Resolve Icon Color from CSS Variable to Hex for LordIcon
    const [iconColor, setIconColor] = React.useState<string>('');

    React.useEffect(() => {
        // Delay slightly to ensure styles are applied
        const timer = setTimeout(() => {
            const rootStyle = getComputedStyle(document.documentElement);
            const raw = rootStyle.getPropertyValue('--sidebar-submenu-icon-color').trim();
            // Fallback to primary if empty, assuming standard brand color
            setIconColor(raw || '#e95029');
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Count total submenu items and categories recursively
    const countItemsAndCategories = (items: SubMenuItem[]): { leafCount: number; categoryCount: number } => {
        let leafCount = 0;
        let categoryCount = 0;

        items.forEach(item => {
            if (item.submenu && item.submenu.length > 0) {
                // This is a category/group
                categoryCount++;
                const nested = countItemsAndCategories(item.submenu);
                leafCount += nested.leafCount;
                categoryCount += nested.categoryCount;
            } else {
                // This is a leaf item
                leafCount++;
            }
        });

        return { leafCount, categoryCount };
    };

    // Determine if we should use multi-column layout
    const { leafCount, categoryCount } = countItemsAndCategories(item.submenu);
    const ITEM_HEIGHT = 48; // Approximate height per item in pixels
    const CATEGORY_HEADER_HEIGHT = 40; // Height for category headers
    const HEADER_HEIGHT = 80; // Panel header height
    const PADDING = 32; // Top and bottom padding
    const FOOTER_MARGIN = 80; // Bottom margin for safety
    const MAX_SINGLE_COLUMN_HEIGHT = window.innerHeight - HEADER_HEIGHT - PADDING - FOOTER_MARGIN;

    // Calculate estimated height including category headers
    const estimatedHeight = (leafCount * ITEM_HEIGHT) + (categoryCount * CATEGORY_HEADER_HEIGHT);

    // Use 2 columns if:
    // 1. Estimated height exceeds viewport (PRIMARY trigger)
    // 2. OR more than 10 leaf items (SECONDARY trigger)
    // 3. AND NOT Mobile
    const shouldUseMultiColumn = !isMobile && (estimatedHeight > MAX_SINGLE_COLUMN_HEIGHT || leafCount > 10);

    // Layout Logic: Dynamic column based on item count
    // On mobile, use full width up to a max, or fixed sidebar width
    const containerWidthClass = isMobile ? 'w-[280px]' : (shouldUseMultiColumn ? 'w-[640px]' : 'w-[320px]');

    return (
        <>
            {/* Backdrop for Blur Effect and Click Outside */}
            {isVisible && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            <div
                className={`
                    fixed top-0 bottom-0 ${containerWidthClass}
                    bg-white border-r border-[var(--sidebar-border)] shadow-[0_0_30px_rgba(0,0,0,0.1)] z-[60]
                    overflow-y-auto py-0 transition-transform duration-300 ease-in-out
                    [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full
                    ${isVisible ? 'translate-x-0' : '-translate-x-full opacity-0'}
                `}
                style={{ left: `${leftOffset}px` }}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                {/* Header with Title and Close */}
                <div className={`flex items-center justify-between ${isMobile ? 'px-2 py-3' : 'p-4'} border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm`}>
                    <div className="flex items-center gap-3">
                        {/* Optional Icon */}
                        {/* Header Icon */}
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                                backgroundColor: 'var(--sidebar-submenu-icon-bg)',
                                // color: 'var(--sidebar-submenu-icon-color)' // Handled by iconColor now for icon
                            }}
                        >
                            {getIconSrc(item.title, true) ? (
                                <lord-icon
                                    src={getIconSrc(item.title, true) || undefined}
                                    trigger="hover"
                                    colors={`primary:${iconColor || '#e95029'},secondary:${iconColor || '#e95029'}`}
                                    style={{ width: '24px', height: '24px' }}
                                />
                            ) : (
                                <LayoutDashboard size={18} className="text-[var(--sidebar-submenu-icon-color)]" />
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="px-[18px] py-4">
                    {/* For flat lists (single column), show the parent menu title as header (Redundant if header exists above, but keeping for structure) */}
                    {/* {!isMultiColumn && !hasNestedGroups && (
                    <div className="submenuSectionTitle text-[12px] font-semibold text-[#3F4254] uppercase tracking-wider mb-2">
                        <span>{item.title}</span>
                    </div>
                )} */}

                    <SubMenuColumn
                        items={item.submenu}
                        isActive={isActive}
                        onLinkClick={handleLinkClick}
                        onFavorite={handleFavorite}
                        useMultiColumn={shouldUseMultiColumn}
                    />
                </div>
            </div>
        </>
    );
};
