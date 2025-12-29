import { useAppSelector } from '../hooks';
export const useMenu = () => {
    const { menuConfig, entityPreferences } = useAppSelector((state) => state.config);
    const { permissions, user, preferences } = useAppSelector((state) => state.auth);
    // Transform logic
    const getFilteredMenu = () => {
        if (!menuConfig) {
            return [];
        }
        let rawItems = [];
        // Determine which section to use based on user role/type
        // For now assuming 'admin' or 'entity' based on existence of entityPreferences
        // In real app, check user.role or userType
        if (user?.role === 'superadmin') {
            rawItems = menuConfig.adminAside?.items || [];
        }
        else if (entityPreferences) { // If logged in as entity
            rawItems = menuConfig.entityAside?.items || [];
        }
        const favourites = preferences?.favourites || [];
        return transformMenuItems(rawItems, favourites);
    };
    const transformMenuItems = (items, favourites) => {
        let updatedItems = [];
        for (const item of items) {
            // 1. Check Permissions
            let hasPermission = true;
            if (item.entPermission) {
                hasPermission = permissions.includes(item.entPermission);
            }
            else if (item.admPermission) {
                hasPermission = permissions.includes(item.admPermission);
            }
            if (!hasPermission)
                continue;
            // 2. Clone item to avoid mutating store
            const newItem = { ...item };
            // 3. Rename Title based on Preferences
            if (entityPreferences?.displayNames) {
                newItem.title = renameTitle(newItem.title, entityPreferences.displayNames);
            }
            // 4. Check Favourite Status
            newItem.fav = favourites.some((f) => f.name === newItem.title);
            // 5. Process Submenu
            if (newItem.submenu && newItem.submenu.length > 0) {
                newItem.submenu = transformMenuItems(newItem.submenu, favourites);
                // Also check if any child is favourite, might be relevant for parent highlighting, but typically only leaf or direct subitems are marked. 
                // However, matching Angular logic, we might not need to mark parent as fav based on child. 
            }
            // 6. Version Check (Attendance) - simplified for now
            if (newItem.title === 'Attendance' && entityPreferences?.studentAttendanceVersion !== 'old')
                continue;
            if (newItem.title === 'Attendance New' && entityPreferences?.studentAttendanceVersion !== 'new')
                continue;
            updatedItems.push(newItem);
        }
        return updatedItems;
    };
    const renameTitle = (title, displayNames) => {
        // Simple exact match replacement or lookup
        // Based on Angular logic:
        const map = {
            'Events': displayNames.event,
            'Partner Institutes': displayNames.partnerInstitute,
            'Class': displayNames.course,
            // Add more as needed
        };
        return map[title] || title;
    };
    return {
        menuItems: getFilteredMenu(),
        isLoading: !menuConfig
    };
};
