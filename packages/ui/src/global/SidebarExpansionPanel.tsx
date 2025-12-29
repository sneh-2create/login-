import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuItem, SubMenuItem } from './types';
import { useAppSelector, useAppDispatch, updatePreferences } from '@od-erp/store';
import { commonService } from '@od-erp/api-client';

interface SidebarExpansionPanelProps {
    item: MenuItem | null;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

// Helper component for rendering a column of submenu items
const SubMenuColumn: React.FC<{
    items: SubMenuItem[];
    isActive: (path?: string) => boolean;
    onLinkClick: () => void;
    onFavorite: (e: React.MouseEvent, item: SubMenuItem) => void;
}> = ({ items, isActive, onLinkClick, onFavorite }) => {
    return (
        <div className="flex flex-col gap-6 flex-1 min-w-0">
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
                            <ul className="flex flex-col gap-0.5">
                                {category.submenu.map((subItem, subIndex) => {
                                    const active = isActive(subItem.page);
                                    return (
                                        <li key={subIndex} className="relative group/item">
                                            <Link
                                                to={subItem.page || '#'}
                                                onClick={onLinkClick}
                                                className={`
                                                    flex items-center justify-between
                                                    h-[45px] p-[10px] pl-0 gap-[10px]
                                                    text-[15px] font-normal
                                                    transition-all duration-300
                                                    ${active
                                                        ? 'bg-[var(--sidebar-item-active-bg)] pl-[10px] rounded-[12px] font-bold text-[var(--color-brand)]'
                                                        : 'text-black hover:bg-[var(--sidebar-item-active-bg)] hover:pl-[10px] hover:rounded-[12px] hover:font-bold hover:text-[var(--color-brand)]'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center gap-[10px] min-w-0 overflow-hidden">
                                                    {/* Bullet Icon */}
                                                    <span className={`
                                                        submenuSectionContentItemIcon
                                                        flex-shrink-0 flex items-center justify-center 
                                                        after:content-['○'] after:text-[1.2rem]
                                                        ${active ? "after:content-['●'] after:text-[var(--color-brand)]" : "after:text-[var(--sidebar-bullet-inactive)] group-hover/item:after:content-['●'] group-hover/item:after:text-[var(--color-brand)]"}
                                                    `}></span>
                                                    <span className="truncate">{subItem.title}</span>
                                                </div>
                                            </Link>
                                            {/* Favorite Icon */}
                                            <div
                                                onClick={(e) => onFavorite(e, subItem)}
                                                className="flex items-center justify-center absolute top-0 right-0 h-full px-[10px] z-[2]"
                                            >
                                                <lord-icon
                                                    src={subItem.fav ? 'https://cdn.lordicon.com/xjronrda.json' : 'https://cdn.lordicon.com/vcuhguff.json'}
                                                    trigger="hover"
                                                    colors="primary:var(--color-brand),secondary:var(--color-brand)"
                                                    stroke="bold"
                                                    style={{ width: '24px', height: '24px', cursor: 'pointer' }}
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
                                    flex items-center justify-between
                                    h-[45px] p-[10px] pl-0 gap-[10px]
                                    text-[15px] font-normal
                                    transition-all duration-300
                                    ${isActive(category.page)
                                        ? 'bg-[#f0f3ff] pl-[10px] rounded-[12px] font-bold text-[#5d78ff]'
                                        : 'text-black hover:bg-[#f0f3ff] hover:pl-[10px] hover:rounded-[12px] hover:font-bold hover:text-[#5d78ff]'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-[10px] min-w-0 overflow-hidden">
                                    {/* Bullet Icon */}
                                    <span className={`
                                        submenuSectionContentItemIcon
                                        flex-shrink-0 flex items-center justify-center 
                                        after:content-['○'] after:text-[1.2rem]
                                        ${isActive(category.page) ? "after:content-['●'] after:text-[#5d78ff]" : "after:text-[#b8bac3] group-hover/item:after:content-['●'] group-hover/item:after:text-[#5d78ff]"}
                                    `}></span>
                                    <span className="truncate">{category.title}</span>
                                </div>
                            </Link>
                            {/* Favorite Icon */}
                            <div
                                onClick={(e) => onFavorite(e, category)}
                                className="flex items-center justify-center absolute top-0 right-0 h-full px-[10px] z-[2]"
                            >
                                <lord-icon
                                    src={category.fav ? 'https://cdn.lordicon.com/xjronrda.json' : 'https://cdn.lordicon.com/vcuhguff.json'}
                                    trigger="hover"
                                    colors="primary:#5d78ff,secondary:#5d78ff"
                                    stroke="bold"
                                    style={{ width: '24px', height: '24px', cursor: 'pointer' }}
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

    // Layout Logic: Masonry-style split for "Immediate Below" behavior
    // If submenu has nested groups (submenu property on items), use multi-column if length > 1
    // If submenu is just a flat list of items (no nested submenu), force single column and show title
    const hasNestedGroups = item.submenu.some(sub => sub.submenu && sub.submenu.length > 0);
    const isMultiColumn = hasNestedGroups && item.submenu.length > 1;
    const containerWidthClass = isMultiColumn ? 'w-[600px]' : 'w-[320px]';

    // Split items into Left (Evens) and Right (Odds) columns for masonry effect
    const leftItems = item.submenu.filter((_, i) => i % 2 === 0);
    const rightItems = item.submenu.filter((_, i) => i % 2 === 1);

    return (
        <div
            className={`
                fixed left-[100px] top-[80px] bottom-0 ${containerWidthClass}
                bg-white border-r border-[var(--sidebar-border)] shadow-[2px_0_5px_rgba(0,0,0,0.5)] z-10 
                overflow-y-auto py-[18px] transition-all duration-300 ease-in-out
                [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full
                ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
            `}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="px-[18px]">
                {/* For flat lists (single column), show the parent menu title as header */}
                {!isMultiColumn && !hasNestedGroups && (
                    <div className="submenuSectionTitle text-[12px] font-semibold text-[#3F4254] uppercase tracking-wider mb-2">
                        <span>{item.title}</span>
                    </div>
                )}

                {isMultiColumn ? (
                    <div className="flex gap-8 items-start">
                        <SubMenuColumn
                            items={leftItems}
                            isActive={isActive}
                            onLinkClick={handleLinkClick}
                            onFavorite={handleFavorite}
                        />
                        <SubMenuColumn
                            items={rightItems}
                            isActive={isActive}
                            onLinkClick={handleLinkClick}
                            onFavorite={handleFavorite}
                        />
                    </div>
                ) : (
                    <SubMenuColumn
                        items={item.submenu}
                        isActive={isActive}
                        onLinkClick={handleLinkClick}
                        onFavorite={handleFavorite}
                    />
                )}
            </div>
        </div>
    );
};
